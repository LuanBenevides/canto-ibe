import React, { useEffect, useState } from 'react';
import { getAll, upsert, remove } from '../services/storageService';
import {
  Card,
  Input,
  Checkbox,
  Button,
  List,
  Space,
  Typography,
  message,
  Popconfirm,
} from 'antd';
import { EditOutlined, DeleteOutlined, SaveOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

export default function Instruments() {
  const [instruments, setInstruments] = useState([]);
  const [form, setForm] = useState({ name: '', available: true, id: null });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const data = await getAll('instruments');
    setInstruments(data);
  }

  async function save() {
    if (!form.name.trim()) {
      message.warning('Informe o nome do instrumento.');
      return;
    }

    setLoading(true);
    await upsert('instruments', form);
    message.success(form.id ? 'Instrumento atualizado!' : 'Instrumento salvo!');
    setForm({ name: '', available: true, id: null });
    setLoading(false);
    load();
  }

  function edit(i) {
    setForm({
      id: i.id,
      name: i.name,
      available: i.available,
    });
  }


  async function del(id) {
    await remove('instruments', id);
    message.success('Instrumento removido!');
    load();
  }

  return (
    <Card
      title={<Title level={3}>Instrumentos</Title>}
      bordered={false}
      style={{
        maxWidth: 600,
        margin: '2rem auto',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        borderRadius: 12,
      }}
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <Input
          placeholder="Nome do instrumento"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <Checkbox
          checked={!!form.available}
          onChange={(e) => setForm({ ...form, available: e.target.checked })}
        >
          Disponível
        </Checkbox>

        <Button
          type="primary"
          icon={<SaveOutlined />}
          onClick={save}
          loading={loading}
          block
        >
          {form.id ? 'Atualizar' : 'Salvar'}
        </Button>

        <List
          dataSource={instruments}
          locale={{ emptyText: 'Nenhum instrumento cadastrado.' }}
          renderItem={(i) => (
            <List.Item
              actions={[
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  onClick={() => edit(i)}
                >
                  Editar
                </Button>,
                <Popconfirm
                  title="Tem certeza que deseja excluir?"
                  onConfirm={() => del(i.id)}
                  okText="Sim"
                  cancelText="Não"
                >
                  <Button type="text" danger icon={<DeleteOutlined />}>
                    Apagar
                  </Button>
                </Popconfirm>,
              ]}
            >
              <List.Item.Meta
                title={
                  <Text strong>
                    {i.name}
                  </Text>
                }
                description={
                  <Text type={i.available ? 'success' : 'secondary'}>
                    {i.available ? 'Disponível' : 'Indisponível'}
                  </Text>
                }
              />
            </List.Item>
          )}
        />
      </Space>
    </Card>
  );
}
