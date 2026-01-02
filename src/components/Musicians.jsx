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
  message,
} from 'antd';
import { EditOutlined, DeleteOutlined, SaveOutlined, PlusOutlined } from '@ant-design/icons';
import { getAll, upsert, remove } from '../services/storageService';

const { Title, Text } = Typography;

export default function Musicians() {
  const [musicians, setMusicians] = useState([]);
  const [instruments, setInstruments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);

  const [form] = Form.useForm();

  useEffect(() => {
    loadMusicians();
    loadInstruments();
  }, []);

  async function loadMusicians() {
    setLoading(true);
    const data = await getAll('musicians');
    setMusicians(data);
    setLoading(false);
  }

  async function loadInstruments() {
    const data = await getAll('instruments');
    setInstruments(data);
  }

  async function onSave(values) {
    const payload = editing ? { ...editing, ...values } : values;
    await upsert('musicians', payload);
    message.success(editing ? 'Músico atualizado!' : 'Músico salvo!');
    form.resetFields();
    setEditing(null);
    loadMusicians();
  }

  function handleEdit(record) {
    setEditing(record);
    form.setFieldsValue(record);
  }

  async function handleDelete(id) {
    await remove('musicians', id);
    message.info('Músico removido!');
    loadMusicians();
  }

  const columns = [
    {
      title: 'Nome',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Contato',
      dataIndex: 'contact',
      key: 'contact',
    },
    {
      title: 'Instrumento',
      key: 'instrument',
      render: (_, record) => {
        const instrument = instruments.find(i => i.id === record.instrumentId);
        return <Text>{instrument?.name || '-'}</Text>;
      },
    },
    {
      title: 'Ações',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            Editar
          </Button>

          <Popconfirm
            title="Deseja realmente excluir este músico?"
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
      <Title level={3}>Músicos</Title>

      <Card size="small" style={{ marginBottom: 24 }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onSave}
          autoComplete="off"
        >
          <Form.Item
            label="Nome"
            name="name"
            rules={[{ required: true, message: 'Digite o nome do músico' }]}
          >
            <Input placeholder="Nome do músico" />
          </Form.Item>

          <Form.Item label="Contato" name="contact">
            <Input placeholder="Telefone ou e-mail" />
          </Form.Item>

          <Form.Item
            label="Instrumento"
            name="instrumentId"
            rules={[{ required: true, message: 'Selecione o instrumento' }]}
          >
            <Select placeholder="Selecione o instrumento">
              {instruments.map(i => (
                <Select.Option key={i.id} value={i.id}>
                  {i.name}
                </Select.Option>
              ))}
            </Select>
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
        dataSource={musicians}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 5 }}
      />
    </Card>
  );
}
