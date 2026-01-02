import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Select,
  Button,
  DatePicker,
  Table,
  Space,
  Popconfirm,
  message,
  Typography,
  Input,
} from 'antd';
import { PlusOutlined, DeleteOutlined, FileTextOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { getAll, addSchedule, deleteSchedule } from '../services/storageService';
import { downloadMonthlySchedule } from '../utils/pdf';

const { Title, Text } = Typography;

export default function AgendaCalendar() {
  const [date, setDate] = useState(dayjs());
  const [singers, setSingers] = useState([]);
  const [musicians, setMusicians] = useState([]);
  const [instruments, setInstruments] = useState([]);
  const [songs, setSongs] = useState([]);
  const [schedule, setSchedule] = useState([]);

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const [s, m, i, sch, so] = await Promise.all([
      getAll('singers'),
      getAll('musicians'),
      getAll('instruments'),
      getAll('schedule'),
      getAll('songs'),
    ]);
    setSingers(s);
    setMusicians(m);
    setInstruments(i);
    setSchedule(sch);
    setSongs(so);
    setLoading(false);
  }

  async function saveSchedule(values) {
    if (!values.leaderId) return message.warning('Selecione o dirigente');
    if (!values.songsSelection || values.songsSelection.length === 0)
      return message.warning('Selecione pelo menos uma música');

    await addSchedule(
      date.format('YYYY-MM-DD'),
      values.singers,
      values.musiciansSelection,
      values.leaderId,
      values.songsSelection
    );

    message.success('Escala salva!');
    form.resetFields();
    loadData();
  }

  const selectedSchedules = schedule.filter(
    s => s.date === date.format('YYYY-MM-DD')
  );

  // Colunas da tabela de escalas
  const columns = [
    {
      title: 'Dirigente',
      key: 'leader',
      render: (_, sch) => {
        const l = singers.find(s => s.id === sch.leaderId);
        return l ? `${l.firstName} ${l.lastName}` : 'Removido';
      },
    },
    {
      title: 'Cantores',
      key: 'singers',
      render: (_, sch) =>
        sch.singers
          .map(id => {
            const c = singers.find(s => s.id === id);
            return c ? `${c.firstName} ${c.lastName}` : 'Removido';
          })
          .join(', '),
    },
    {
      title: 'Músicos',
      key: 'musicians',
      render: (_, sch) =>
        Object.entries(sch.musiciansSelection)
          .map(([instId, musId]) => {
            const inst = instruments.find(i => i.id === instId)?.name;
            const mus = musicians.find(m => m.id === musId)?.name;
            return `${inst}: ${mus || 'Removido'}`;
          })
          .join(' | '),
    },
    {
      title: 'Músicas',
      key: 'songs',
      render: (_, sch) =>
        sch.songsSelection
          .map(s => {
            const song = songs.find(song => song.id === s.songId);
            return song ? `${song.title} (${s.key || 'N/A'})` : 'Removida';
          })
          .join(', '),
    },
    {
      title: 'Ações',
      key: 'actions',
      render: (_, sch) => (
        <Popconfirm
          title="Deseja realmente apagar esta escala?"
          onConfirm={async () => {
            await deleteSchedule(sch.id);
            message.info('Escala removida');
            loadData();
          }}
          okText="Sim"
          cancelText="Não"
        >
          <Button danger icon={<DeleteOutlined />}>
            Apagar
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <Card
      style={{ maxWidth: 1000, margin: '2rem auto', borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}
    >
      <Title level={3}>Agenda / Escala de Louvor</Title>

      {/* Data */}
      <Form form={form} layout="vertical" onFinish={saveSchedule} initialValues={{ songsSelection: [] }}>
        <Form.Item label="Data">
          <DatePicker value={date} onChange={setDate} style={{ width: '100%' }} />
        </Form.Item>

        {/* Dirigente */}
        <Form.Item
          label="Dirigente"
          name="leaderId"
          rules={[{ required: true, message: 'Selecione o dirigente' }]}
        >
          <Select placeholder="Selecione cantor">
            {singers.map(s => (
              <Select.Option key={s.id} value={s.id}>
                {s.firstName} {s.lastName}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        {/* Cantores */}
        <Form.Item label="Cantores" name="singers">
          <Select
            mode="multiple"
            placeholder="Selecione cantores"
            options={singers.map(s => ({
              label: `${s.firstName} ${s.lastName}`,
              value: s.id,
            }))}
          />
        </Form.Item>

        {/* Músicos e instrumentos */}
        {instruments.map(inst => (
          <Form.Item label={inst.name} name={['musiciansSelection', inst.id]} key={inst.id}>
            <Select placeholder={`Selecione músico para ${inst.name}`}>
              {musicians
                .filter(m => m.instrumentId === inst.id)
                .map(m => (
                  <Select.Option key={m.id} value={m.id}>
                    {m.name}
                  </Select.Option>
                ))}
            </Select>
          </Form.Item>
        ))}

        {/* Músicas */}
        <Form.List name="songsSelection">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                  <Form.Item
                    {...restField}
                    name={[name, 'songId']}
                    rules={[{ required: true, message: 'Selecione uma música' }]}
                  >
                    <Select placeholder="Selecione música" style={{ width: 200 }}>
                      {songs.map(song => (
                        <Select.Option key={song.id} value={song.id}>
                          {song.title}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                  <Form.Item {...restField} name={[name, 'key']}>
                    <Input placeholder="Tom" />
                  </Form.Item>
                  <Button type="danger" onClick={() => remove(name)}>
                    Remover
                  </Button>
                </Space>
              ))}
              <Form.Item>
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                  Adicionar música
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" icon={<FileTextOutlined />}>
              Salvar escala
            </Button>
            <Button
              onClick={() =>
                downloadMonthlySchedule(schedule, singers, musicians, instruments, songs)
              }
            >
              Gerar PDF mensal
            </Button>
          </Space>
        </Form.Item>
      </Form>

      <Title level={4} style={{ marginTop: 24 }}>
        Escalas existentes ({date.format('YYYY-MM-DD')})
      </Title>

      <Table
        dataSource={selectedSchedules}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 5 }}
        style={{ marginTop: 16 }}
      />
    </Card>
  );
}
