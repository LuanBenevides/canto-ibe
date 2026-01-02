import React, { useEffect, useState } from 'react';
import {
  Form,
  Input,
  Button,
  Select,
  Table,
  Space,
  Card,
  Typography,
  Popconfirm,
  DatePicker,
  message,
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { getAll, upsert, remove } from '../services/storageService';

const { Title, Text } = Typography;

export default function Impediments() {
  const [impediments, setImpediments] = useState([]);
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);

  const [form] = Form.useForm();

  useEffect(() => {
    loadImpediments();
    loadPeople();
  }, []);

  async function loadImpediments() {
    setLoading(true);
    const data = await getAll('impediments');
    setImpediments(data);
    setLoading(false);
  }

  async function loadPeople() {
    const singers = await getAll('singers');
    const musicians = await getAll('musicians');

    const merged = [
      ...singers.map(s => ({ ...s, type: 'Cantor' })),
      ...musicians.map(m => ({ ...m, type: 'Músico' })),
    ];

    setPeople(merged);
  }

  async function onSave(values) {
    const payload = {
      ...editing,
      ...values,
      date: values.date.format('YYYY-MM-DD'),
    };

    await upsert('impediments', payload);
    message.success(editing ? 'Impedimento atualizado!' : 'Impedimento registrado!');
    form.resetFields();
    setEditing(null);
    loadImpediments();
  }

  function handleEdit(record) {
    setEditing(record);
    form.setFieldsValue({
      ...record,
      date: dayjs(record.date),
    });
  }

  async function handleDelete(id) {
    await remove('impediments', id);
    message.info('Impedimento removido!');
    loadImpediments();
  }

  const columns = [
    {
      title: 'Pessoa',
      key: 'person',
      render: (_, record) => {
        const person = people.find(p => p.id === record.personId);
        return (
          <Text>
            {person?.name || '-'} <Text type="secondary">({person?.type})</Text>
          </Text>
        );
      },
    },
    {
      title: 'Data',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Motivo',
      dataIndex: 'reason',
      key: 'reason',
    },
    {
      title: 'Ações',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Editar
          </Button>

          <Popconfirm
            title="Deseja remover este impedimento?"
            onConfirm={() => handleDelete(record.id)}
            okText="Sim"
            cancelText="Não"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              Apagar
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card
      style={{
        maxWidth: 900,
        margin: '2rem auto',
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
        borderRadius: 12,
      }}
    >
      <Title level={3}>Impedimentos</Title>

      <Card size="small" style={{ marginBottom: 24 }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onSave}
          autoComplete="off"
        >
          <Form.Item
            label="Pessoa"
            name="personId"
            rules={[{ required: true, message: 'Selecione a pessoa' }]}
          >
            <Select placeholder="Selecione o músico ou cantor">
              {people.map(p => (
                <Select.Option key={p.id} value={p.id}>
                  {p.name} ({p.type})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Data"
            name="date"
            rules={[{ required: true, message: 'Selecione a data' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item label="Motivo" name="reason">
            <Input.TextArea placeholder="Motivo do impedimento (opcional)" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                {editing ? 'Atualizar' : 'Salvar'}
              </Button>

              {editing && (
                <Button
                  onClick={() => {
                    form.resetFields();
                    setEditing(null);
                  }}
                >
                  Cancelar
                </Button>
              )}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Table
        dataSource={impediments}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 5 }}
      />
    </Card>
  );
}
