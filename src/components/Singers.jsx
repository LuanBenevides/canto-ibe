import React, { useEffect, useState } from 'react';
import {
  Form,
  Input,
  Button,
  Table,
  Space,
  Card,
  message,
  Typography,
  Popconfirm,
} from 'antd';
import { getAll, upsert, remove } from '../services/storageService';
import {
  EditOutlined,
  DeleteOutlined,
  SaveOutlined,
  StopOutlined,
} from '@ant-design/icons';

const { Title } = Typography;

export default function Singers() {
  const [singers, setSingers] = useState([]);
  const [form] = Form.useForm();
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const data = await getAll('singers');
    setSingers(data);
    setLoading(false);
  }

  async function onFinish(values) {
    const payload = editing ? { ...editing, ...values } : values;
    await upsert('singers', payload);
    message.success(editing ? 'Cantor atualizado!' : 'Cantor salvo!');
    form.resetFields();
    setEditing(null);
    load();
  }

  function handleEdit(record) {
    setEditing(record);
    form.setFieldsValue(record);
  }

  async function handleDelete(id) {
    await remove('singers', id);
    message.info('Cantor removido!');
    load();
  }

  const columns = [
    { title: 'Nome', dataIndex: 'firstName', key: 'firstName' },
    { title: 'Sobrenome', dataIndex: 'lastName', key: 'lastName' },
    { title: 'Contato', dataIndex: 'contact', key: 'contact' },
    { title: 'Tom preferido', dataIndex: 'preferredKey', key: 'preferredKey' },
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
            title="Tem certeza que deseja excluir este cantor?"
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
        maxWidth: 800,
        margin: '2rem auto',
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
        borderRadius: 12,
      }}
    >
      <Title level={3} style={{ marginBottom: 24 }}>
        Cantores
      </Title>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        autoComplete="off"
        style={{ marginBottom: 32 }}
      >
        <Form.Item
          label="Nome"
          name="firstName"
          rules={[{ required: true, message: 'Digite o nome' }]}
        >
          <Input placeholder="Nome" />
        </Form.Item>

        <Form.Item label="Sobrenome" name="lastName">
          <Input placeholder="Sobrenome" />
        </Form.Item>

        <Form.Item label="Contato" name="contact">
          <Input placeholder="Telefone ou e-mail" />
        </Form.Item>

        <Form.Item label="Tom preferido" name="preferredKey">
          <Input placeholder="Ex: Dó, Ré, Mi..." />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined />}
              loading={loading}
            >
              {editing ? 'Atualizar' : 'Salvar'}
            </Button>

            {editing && (
              <Button
                icon={<StopOutlined />}
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

      <Table
        dataSource={singers}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 5 }}
      />
    </Card>
  );
}
