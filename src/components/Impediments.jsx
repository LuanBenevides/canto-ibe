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
import { EditOutlined, DeleteOutlined, SaveOutlined } from '@ant-design/icons';
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
    setImpediments(await getAll('impediments'));
    setLoading(false);
  }

  async function loadPeople() {
    const singers = await getAll('singers');
    const musicians = await getAll('musicians');

    const merged = [
      ...singers.map(s => ({
        id: s.id,
        label: `${s.firstName} ${s.lastName}`,
        type: 'singer',
      })),
      ...musicians.map(m => ({
        id: m.id,
        label: m.name,
        type: 'musician',
      })),
    ];

    setPeople(merged);
  }

  async function onSave(values) {
    const selected = people.find(p => p.id === values.personId);

    const payload = {
      ...editing,
      personId: values.personId,
      personType: selected.type,
      date: values.date.format('YYYY-MM-DD'),
      reason: values.reason || '',
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
      render: (_, record) => {
        const p = people.find(p => p.id === record.personId);
        return (
          <Text>
            {p?.label || '-'}{' '}
            <Text type="secondary">
              ({record.personType === 'singer' ? 'Cantor' : 'Músico'})
            </Text>
          </Text>
        );
      },
    },
    { title: 'Data', dataIndex: 'date' },
    { title: 'Motivo', dataIndex: 'reason' },
    {
      title: 'Ações',
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            Editar
          </Button>
          <Popconfirm
            title="Deseja remover este impedimento?"
            onConfirm={() => handleDelete(record.id)}
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
    <Card style={{ maxWidth: 900, margin: '2rem auto' }}>
      <Title level={3}>Impedimentos</Title>

      <Card size="small" style={{ marginBottom: 24 }}>
        <Form form={form} layout="vertical" onFinish={onSave}>
          <Form.Item
            label="Pessoa"
            name="personId"
            rules={[{ required: true, message: 'Selecione a pessoa' }]}
          >
            <Select placeholder="Selecione cantor ou músico">
              {people.map(p => (
                <Select.Option key={p.id} value={p.id}>
                  {p.label} ({p.type === 'singer' ? 'Cantor' : 'Músico'})
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
            <Input.TextArea />
          </Form.Item>

          <Space>
            <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
              {editing ? 'Atualizar' : 'Salvar'}
            </Button>
            {editing && (
              <Button onClick={() => { form.resetFields(); setEditing(null); }}>
                Cancelar
              </Button>
            )}
          </Space>
        </Form>
      </Card>

      <Table
        dataSource={impediments}
        columns={columns}
        rowKey="id"
        loading={loading}
      />
    </Card>
  );
}
