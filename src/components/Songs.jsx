import React, { useEffect, useState } from 'react';
import {
  Form,
  Input,
  Button,
  Select,
  DatePicker,
  Table,
  Space,
  Card,
  Modal,
  message,
  Typography,
  Popconfirm,
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  DownloadOutlined,
  PlusOutlined,
  SaveOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { getAll, upsert, remove, addPerformance } from '../services/storageService';
import { downloadLyrics } from '../utils/pdf';

const { Title, Text } = Typography;

export default function Songs() {
  const [songs, setSongs] = useState([]);
  const [singers, setSingers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [lyricsModal, setLyricsModal] = useState(false);
  const [lyrics, setLyrics] = useState('');

  const [songForm] = Form.useForm();
  const [perfForm] = Form.useForm();

  useEffect(() => {
    loadSongs();
    loadSingers();
  }, []);

  async function loadSongs() {
    setLoading(true);
    const data = await getAll('songs');
    setSongs(data);
    setLoading(false);
  }

  async function loadSingers() {
    const data = await getAll('singers');
    setSingers(data);
  }

  async function onSaveSong(values) {
    const payload = editing ? { ...editing, ...values, lyrics } : { ...values, lyrics };
    await upsert('songs', payload);
    message.success(editing ? 'Música atualizada!' : 'Música salva!');
    songForm.resetFields();
    setEditing(null);
    setLyrics('');
    loadSongs();
  }

  function handleEdit(song) {
    setEditing(song);
    songForm.setFieldsValue(song);
    setLyrics(song.lyrics || '');
  }

  async function handleDelete(id) {
    await remove('songs', id);
    message.info('Música removida!');
    loadSongs();
  }

  async function handleAddPerformance(values) {
    const { songId, singerId, key, date } = values;
    if (!songId || !singerId) return message.warning('Selecione música e cantor.');
    await addPerformance(songId, singerId, key, date?.format('YYYY-MM-DD'));
    message.success('Performance adicionada!');
    perfForm.resetFields();
    loadSongs();
  }
  function handleDownload(song) {
    const expandedPerformances =
      song.performances?.map((p) => {
        const singer = singers.find((s) => s.id === p.singerId);
        return {
          name: singer ? `${singer.firstName} ${singer.lastName}` : 'Desconhecido',
          key: p.key || '',
          date: p.date || '',
          notes: p.notes || '',
          location: p.location || '',
        };
      }) || [];

    downloadLyrics({
      ...song,
      performances: expandedPerformances,
    });
  }

  const columns = [
    {
      title: 'Título',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Tom original',
      dataIndex: 'originalKey',
      key: 'originalKey',
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
            title="Deseja realmente excluir esta música?"
            onConfirm={() => handleDelete(record.id)}
            okText="Sim"
            cancelText="Não"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              Apagar
            </Button>
          </Popconfirm>

          <Button
            type="link"
            icon={<DownloadOutlined />}
            onClick={() => handleDownload(record)}
          >
            PDF
          </Button>
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
      <Title level={3}>Músicas</Title>
      <Card size="small" style={{ marginBottom: 24 }}>
        <Form
          form={songForm}
          layout="vertical"
          onFinish={onSaveSong}
          autoComplete="off"
        >
          <Form.Item
            label="Título"
            name="title"
            rules={[{ required: true, message: 'Digite o título da música' }]}
          >
            <Input placeholder="Título da música" />
          </Form.Item>

          <Form.Item
            label="Tom original"
            name="originalKey"
            rules={[{ required: true, message: 'Informe o tom original' }]}
          >
            <Input placeholder="Ex: Dó, Ré, Mi..." />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button
                icon={<FileTextOutlined />}
                onClick={() => setLyricsModal(true)}
              >
                {lyrics ? 'Ver / Editar Letra' : 'Adicionar Letra'}
              </Button>

              <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                {editing ? 'Atualizar' : 'Salvar'}
              </Button>

              {editing && (
                <Button
                  onClick={() => {
                    songForm.resetFields();
                    setEditing(null);
                    setLyrics('');
                  }}
                >
                  Cancelar
                </Button>
              )}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Modal
        title="Letra da Música"
        open={lyricsModal}
        onOk={() => setLyricsModal(false)}
        onCancel={() => setLyricsModal(false)}
        okText="Fechar"
        width={700}
      >
        <Input.TextArea
          rows={10}
          value={lyrics}
          onChange={(e) => setLyrics(e.target.value)}
          placeholder="Digite a letra da música aqui..."
        />
      </Modal>

      <Card size="small" title="Adicionar Performance" style={{ marginBottom: 24 }}>
        <Form
          form={perfForm}
          layout="vertical"
          onFinish={handleAddPerformance}
          autoComplete="off"
        >
          <Form.Item
            label="Música"
            name="songId"
            rules={[{ required: true, message: 'Selecione uma música' }]}
          >
            <Select placeholder="Selecione a música">
              {songs.map((s) => (
                <Select.Option key={s.id} value={s.id}>
                  {s.title}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Cantor"
            name="singerId"
            rules={[{ required: true, message: 'Selecione um cantor' }]}
          >
            <Select placeholder="Selecione o cantor">
              {singers.map((s) => (
                <Select.Option key={s.id} value={s.id}>
                  {s.firstName} {s.lastName}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Tom" name="key">
            <Input placeholder="Tom da performance" />
          </Form.Item>

          <Form.Item label="Data" name="date">
            <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" icon={<PlusOutlined />}>
              Adicionar Performance
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Table
        dataSource={songs}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 5 }}
        expandable={{
          expandedRowRender: (song) => (
            song.performances?.length ? (
              <ul style={{ marginLeft: 20 }}>
                {song.performances.map((p, i) => {
                  const singer = singers.find((s) => s.id === p.singerId);
                  return (
                    <li key={i}>
                      <Text strong>{singer?.firstName} {singer?.lastName}</Text> —{' '}
                      Tom: {p.key || '-'} | Data: {p.date || '-'}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <Text type="secondary">Nenhuma performance registrada.</Text>
            )
          ),
        }}
      />
    </Card>
  );
}
