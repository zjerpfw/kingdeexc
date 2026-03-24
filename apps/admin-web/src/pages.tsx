import { Alert, Button, Form, Input, Layout, Menu, Modal, Select, Space, Table, Tag, Tooltip } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { getFieldTooltip, MISSING_DESC_TEXT } from '@kingdee/shared';
import { api } from './api/client';
import { FieldSelect } from './components/FieldSelect';

const { Header, Sider, Content } = Layout;

function useFetch<T>(url: string) {
  const [data, setData] = useState<T[]>([]);
  const load = () => api.get(url).then((r) => setData(r.data));
  useEffect(() => {
    void load();
  }, [url]);
  return { data, load };
}

const LoginPage = ({ onOk }: { onOk: () => void }) => (
  <Layout style={{ minHeight: '100vh', placeItems: 'center', display: 'grid' }}>
    <Form style={{ width: 320 }} onFinish={onOk}>
      <Form.Item name="u" initialValue="admin">
        <Input placeholder="用户名" />
      </Form.Item>
      <Form.Item>
        <Button block type="primary" htmlType="submit">
          登录
        </Button>
      </Form.Item>
    </Form>
  </Layout>
);

function Dashboard() {
  return <div>欢迎使用金蝶精斗云库存替代决策中心。</div>;
}

function Products() {
  const { data } = useFetch<any>('/products');
  return (
    <Table
      rowKey="id"
      dataSource={data}
      columns={[
        { title: '商品', render: (_, r) => `${r.productName}/${r.productCode}` },
        { title: '仓库', dataIndex: 'warehouseName' },
        { title: '单位', render: (_, r) => `${r.baseUnit || '-'} / ${r.auxUnit || '-'}` },
        { title: '换算', dataIndex: 'conversionRate' },
        { title: '解析状态', render: (_, r) => (r.manualReviewRequired ? <Tag color="red">manualReviewRequired</Tag> : <Tag color="green">解析成功</Tag>) },
        { title: '库存(基本)', dataIndex: 'latestInventory' },
      ]}
    />
  );
}

function FieldMeta() {
  const { data, load } = useFetch<any>('/field-meta');
  const [editing, setEditing] = useState<any>();
  return (
    <>
      <Alert type="info" showIcon message="字段统一显示格式：中文名（key）。若无官方说明，提示“暂无官方中文说明，可在后台维护别名”。" />
      <Table
        rowKey="id"
        dataSource={data}
        columns={[
          { title: '来源', dataIndex: 'source' },
          {
            title: '字段',
            render: (_, r) => (
              <Tooltip title={r.descriptionZh || MISSING_DESC_TEXT}>{`${r.labelZh}（${r.fieldKey}）`}</Tooltip>
            ),
          },
          { title: '说明', render: (_, r) => r.descriptionZh || MISSING_DESC_TEXT },
          { title: '别名可编辑', render: (_, r) => String(r.aliasEditable) },
          { title: '操作', render: (_, r) => <Button onClick={() => setEditing(r)} disabled={!r.aliasEditable}>编辑别名</Button> },
        ]}
      />
      <Modal
        open={!!editing}
        onCancel={() => setEditing(undefined)}
        onOk={async () => {
          await api.put(`/field-meta/${editing.id}`, { labelZh: editing.labelZh, descriptionZh: editing.descriptionZh });
          setEditing(undefined);
          load();
        }}
      >
        <Form layout="vertical">
          <Form.Item label="中文别名">
            <Input value={editing?.labelZh} onChange={(e) => setEditing({ ...editing, labelZh: e.target.value })} />
          </Form.Item>
          <Form.Item label="中文说明">
            <Input value={editing?.descriptionZh} onChange={(e) => setEditing({ ...editing, descriptionZh: e.target.value })} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

function Rules() {
  const { data, load } = useFetch<any>('/replacement-rules');
  const products = useFetch<any>('/products/search?keyword=').data;
  const formulas = useFetch<any>('/formula-profiles').data;
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  return (
    <>
      <Alert type="info" showIcon message="请选择商品，不要手填 JSON。商品列表显示：名称/编码/单位/换算公式/库存快照。" />
      <Button type="primary" onClick={() => setOpen(true)}>新增规则</Button>
      <Table
        rowKey="ruleId"
        dataSource={data}
        columns={[
          { title: '源商品', render: (_, r) => `${r.sourceProductName}/${r.sourceProductCode}` },
          { title: '替代商品', render: (_, r) => `${r.targetProductName}/${r.targetProductCode}` },
          { title: '优先级', dataIndex: 'priority' },
          { title: '公式模板', dataIndex: 'formulaProfileId' },
          { title: '启用', render: (_, r) => String(r.enabled) },
        ]}
      />
      <Modal
        open={open}
        onCancel={() => setOpen(false)}
        onOk={async () => {
          const v = await form.validateFields();
          const source = products.find((p: any) => p.productCode === v.sourceProductCode);
          const target = products.find((p: any) => p.productCode === v.targetProductCode);
          await api.post('/replacement-rules', { ...v, sourceProductName: source?.productName || v.sourceProductCode, targetProductName: target?.productName || v.targetProductCode, enabled: true });
          setOpen(false);
          load();
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="sourceProductCode" label="原商品" rules={[{ required: true }]}>
            <Input list="product-list" placeholder="商品编码" />
          </Form.Item>
          <Form.Item name="targetProductCode" label="替代商品" rules={[{ required: true }]}>
            <Input list="product-list" placeholder="商品编码" />
          </Form.Item>
          <datalist id="product-list">
            {products.map((p: any) => (
              <option key={p.id} value={p.productCode}>{`${p.productName}/${p.productCode}/${p.baseUnit || '-'} / ${p.auxUnit || '-'} / ${p.conversionRate || '-'} / 库存:${p.latestInventory || 0}`}</option>
            ))}
          </datalist>
          <Form.Item name="priority" label="优先级" initialValue={100}><Input /></Form.Item>
          <Form.Item name="formulaProfileId" label="公式模板"><Input list="formula-list" /></Form.Item>
          <datalist id="formula-list">{formulas.map((f: any) => <option key={f.id} value={f.id}>{f.name}</option>)}</datalist>
        </Form>
      </Modal>
    </>
  );
}

function Formulas() {
  const { data, load } = useFetch<any>('/formula-profiles');
  const fields = useFetch<any>('/field-meta').data.filter((f: any) => f.source === 'sales_order_detail');
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  return (
    <>
      <Alert type="info" showIcon message="字段选择器统一显示中文名（key），tooltip 优先显示样例中文说明。" />
      <Button onClick={() => setOpen(true)} type="primary">新建公式模板</Button>
      <Table rowKey="id" dataSource={data} columns={[{ title: '名称', dataIndex: 'name' }, { title: '描述', dataIndex: 'description' }]} />
      <Modal
        open={open}
        onCancel={() => setOpen(false)}
        onOk={async () => {
          const v = await form.validateFields();
          const configJson = {
            demandFieldKey: v.demandFieldKey,
            executedFieldKey: v.executedFieldKey,
            purchaseInboundFieldKey: v.purchaseInboundFieldKey,
            purchaseTransitFieldKey: v.purchaseTransitFieldKey,
            salesOccupyFieldKey: v.salesOccupyFieldKey,
            instantInventoryFieldKey: v.instantInventoryFieldKey,
            compareUnit: v.compareUnit || 'base_unit',
            threshold: Number(v.threshold || 0),
          };
          await api.post('/formula-profiles', { name: v.name, description: v.description, configJson });
          setOpen(false);
          load();
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="模板名称" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="description" label="说明"><Input /></Form.Item>
          <Form.Item name="demandFieldKey" label="需求字段"><FieldSelect fields={fields} /></Form.Item>
          <Form.Item name="executedFieldKey" label="已执行字段"><FieldSelect fields={fields} /></Form.Item>
          <Form.Item name="purchaseInboundFieldKey" label="采购订单入库字段"><FieldSelect fields={fields} /></Form.Item>
          <Form.Item name="purchaseTransitFieldKey" label="采购在途字段"><FieldSelect fields={fields} /></Form.Item>
          <Form.Item name="salesOccupyFieldKey" label="销售占用字段"><FieldSelect fields={fields} /></Form.Item>
          <Form.Item name="instantInventoryFieldKey" label="即时库存字段" initialValue="instantqty"><FieldSelect fields={fields} /></Form.Item>
          <Form.Item name="compareUnit" label="比较单位" initialValue="base_unit"><Select options={[{ label: '基本单位（base_unit）', value: 'base_unit' }, { label: '订单单位（order_unit）', value: 'order_unit' }]} /></Form.Item>
          <Form.Item name="threshold" label="阈值" initialValue={0}><Input /></Form.Item>
        </Form>
      </Modal>
    </>
  );
}

function Releases() {
  const { data, load } = useFetch<any>('/releases/history');
  return (
    <>
      <Space>
        <Button onClick={async () => { await api.post('/releases/publish'); load(); }}>发布</Button>
      </Space>
      <Table rowKey="id" dataSource={data} columns={[{ title: '版本', dataIndex: 'version' }, { title: '时间', dataIndex: 'releasedAt' }, { title: '状态', dataIndex: 'status' }, { title: '校验', dataIndex: 'checksum' }, { title: '操作', render: (_, r) => <Button onClick={async () => { await api.post(`/releases/${r.version}/rollback`); load(); }}>回滚</Button> }]} />
    </>
  );
}

function Audit() {
  const { data } = useFetch<any>('/audit-logs');
  return <Table rowKey="id" dataSource={data} columns={[{ title: '时间', dataIndex: 'createdAt' }, { title: '操作人', dataIndex: 'actor' }, { title: '动作', dataIndex: 'action' }, { title: '实体', render: (_, r) => `${r.entityType}:${r.entityId}` }]} />;
}

function DebugSimulation() {
  const formulas = useFetch<any>('/formula-profiles').data;
  const [inventoryJson, setInventoryJson] = useState('[{"materialid_number":"A1001","materialid_name":"一次性手套","qty":360}]');
  const [orderJson, setOrderJson] = useState('[{"materialid":"A1001","material_name":"一次性手套","unit":"箱","qty":3,"baseunit":"副","baseqty":540,"out_qty":1,"purordinqty":1,"purtransitqty":0.5,"conversionrate":"1 箱 = 180 副","instantqty":360}]');
  const [result, setResult] = useState<any>(null);
  const [formulaId, setFormulaId] = useState<string>();

  const run = () => {
    try {
      const inv = JSON.parse(inventoryJson);
      const ord = JSON.parse(orderJson);
      const f = formulas.find((x: any) => x.id === formulaId) || formulas[0];
      if (!f) return;
      const row = ord[0] || {};
      const demand = Number(row.baseqty ?? row.qty ?? 0);
      const executed = Number(row.pick_out_baseqty ?? row.out_qty ?? 0);
      const purchaseIn = Number(row.purordinqty ?? 0);
      const transit = Number(row.purtransitqty ?? 0);
      const instant = Number(row.instantqty ?? inv[0]?.qty ?? 0);
      const gap = demand - executed - purchaseIn - transit - instant;
      setResult({ formulaName: f.name, row, gap, detail: { demand, executed, purchaseIn, transit, instant }, formula: `${demand} - ${executed} - ${purchaseIn} - ${transit} - ${instant} = ${gap}` });
    } catch (e: any) {
      setResult({ error: e.message });
    }
  };

  return (
    <>
      <Alert type="info" showIcon message="本页用于无 tf.jdy.com 环境时的本地联调模拟。可直接粘贴样例 JSON。" />
      <Space direction="vertical" style={{ width: '100%' }}>
        <Select value={formulaId} onChange={setFormulaId} placeholder="选择公式模板" options={formulas.map((f: any) => ({ label: f.name, value: f.id }))} />
        <Input.TextArea rows={6} value={inventoryJson} onChange={(e) => setInventoryJson(e.target.value)} placeholder="库存 JSON" />
        <Input.TextArea rows={8} value={orderJson} onChange={(e) => setOrderJson(e.target.value)} placeholder="订单 JSON" />
        <Button type="primary" onClick={run}>运行模拟</Button>
        {result && <pre>{JSON.stringify(result, null, 2)}</pre>}
      </Space>
    </>
  );
}


function AcceptanceCheck() {
  const releases = useFetch<any>('/releases/history').data;
  const fields = useFetch<any>('/field-meta').data;
  const products = useFetch<any>('/products').data;
  const rules = useFetch<any>('/replacement-rules').data;
  const formulas = useFetch<any>('/formula-profiles').data;
  const logs = useFetch<any>('/audit-logs').data;
  const [sim, setSim] = useState({ qty: 3, out_qty: 1, purordinqty: 1, purtransitqty: 0.5, instantqty: 100, conversionrate: '1 箱 = 180 副' });
  const [simResult, setSimResult] = useState<any>();

  const conversionStats = useMemo(() => {
    const parsed = products.filter((p: any) => !p.manualReviewRequired).length;
    const manual = products.filter((p: any) => p.manualReviewRequired).length;
    return { parsed, manual, total: products.length };
  }, [products]);

  const runSimulation = () => {
    const demand = Number(sim.qty) * 180;
    const executed = Number(sim.out_qty) * 180;
    const inbound = Number(sim.purordinqty) * 180;
    const transit = Number(sim.purtransitqty) * 180;
    const instant = Number(sim.instantqty);
    const gap = demand - executed - inbound - transit - instant;
    setSimResult({ demand, executed, inbound, transit, instant, gap, formula: `${demand}-${executed}-${inbound}-${transit}-${instant}=${gap}` });
  };

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Alert type="info" showIcon message="验收检查页：用于上线前快速确认核心数据、发布状态、换算风险和模拟计算。" />
      <Table
        pagination={false}
        dataSource={[
          { k: '系统当前版本', v: 'v0.1.0' },
          { k: '最新已发布规则包版本', v: releases[0]?.version || '-' },
          { k: '字段字典数量', v: fields.length },
          { k: '商品数量', v: products.length },
          { k: '规则数量', v: rules.length },
          { k: '公式模板数量', v: formulas.length },
          { k: '换算解析成功', v: `${conversionStats.parsed}/${conversionStats.total}` },
          { k: 'manualReviewRequired 商品数', v: conversionStats.manual },
        ]}
        columns={[{ title: '检查项', dataIndex: 'k' }, { title: '值', dataIndex: 'v' }]}
        rowKey="k"
      />

      <Table rowKey="id" dataSource={logs.slice(0, 5)} columns={[{ title: '最近审计日志', dataIndex: 'action' }, { title: '操作人', dataIndex: 'actor' }, { title: '时间', dataIndex: 'createdAt' }]} />
      <Table rowKey="id" dataSource={products.filter((p: any) => p.manualReviewRequired)} columns={[{ title: '需人工确认商品', render: (_, r) => `${r.productName}（${r.productCode}）` }, { title: '换算公式', dataIndex: 'conversionRate' }]} />

      <Alert type="warning" showIcon message="模拟订单计算（示例按 1 箱=180 基本单位演示），用于快速验收缺口公式闭环。" />
      <Space wrap>
        <Input addonBefore="qty" value={sim.qty} onChange={(e) => setSim({ ...sim, qty: Number(e.target.value || 0) })} />
        <Input addonBefore="out_qty" value={sim.out_qty} onChange={(e) => setSim({ ...sim, out_qty: Number(e.target.value || 0) })} />
        <Input addonBefore="purordinqty" value={sim.purordinqty} onChange={(e) => setSim({ ...sim, purordinqty: Number(e.target.value || 0) })} />
        <Input addonBefore="purtransitqty" value={sim.purtransitqty} onChange={(e) => setSim({ ...sim, purtransitqty: Number(e.target.value || 0) })} />
        <Input addonBefore="instantqty" value={sim.instantqty} onChange={(e) => setSim({ ...sim, instantqty: Number(e.target.value || 0) })} />
        <Button onClick={runSimulation} type="primary">计算缺口</Button>
      </Space>
      {simResult && <pre>{JSON.stringify(simResult, null, 2)}</pre>}
    </Space>
  );
}

export default function App() {
  const routeToKey: Record<string, string> = { '/acceptance-check': 'acceptance' };
  const [logged, setLogged] = useState(false);
  const [key, setKey] = useState(routeToKey[window.location.pathname] || 'dashboard');
  const view = useMemo(() => ({ dashboard: <Dashboard />, products: <Products />, field: <FieldMeta />, rules: <Rules />, formulas: <Formulas />, releases: <Releases />, audit: <Audit />, debug: <DebugSimulation />, acceptance: <AcceptanceCheck /> }[key]), [key]);
  if (!logged) return <LoginPage onOk={() => setLogged(true)} />;
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider>
        <Menu
          theme="dark"
          selectedKeys={[key]}
          onClick={(i) => { setKey(i.key); if (i.key === 'acceptance') window.history.replaceState(null, '', '/acceptance-check'); else window.history.replaceState(null, '', '/'); }}
          items={[
            { key: 'dashboard', label: '仪表盘' },
            { key: 'products', label: '商品主数据' },
            { key: 'field', label: '字段字典' },
            { key: 'rules', label: '替代规则' },
            { key: 'formulas', label: '公式模板' },
            { key: 'releases', label: '发布管理' },
            { key: 'audit', label: '审计日志' },
            { key: 'debug', label: '联调模拟页' },
            { key: 'acceptance', label: '验收检查页' },
          ]}
        />
      </Sider>
      <Layout>
        <Header style={{ color: '#fff' }}>库存替代决策中心</Header>
        <Content style={{ padding: 16 }}>{view}</Content>
      </Layout>
    </Layout>
  );
}
