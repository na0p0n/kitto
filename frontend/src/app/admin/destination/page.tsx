"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import styles from "./page.module.css";

const API = process.env.NEXT_PUBLIC_API_URL ?? "";

const CATEGORIES = ["ラーメン", "牛丼", "ファストフード", "カフェ", "ファミレス", "回転寿司"];

const SAMPLE_CSV = `chain_name,store_name,prefecture,address
山岡家,山岡家 水戸南店,茨城,茨城県水戸市河和田町1234-5
山岡家,山岡家 仙台泉店,宮城,宮城県仙台市泉区泉中央1-1-1
すき家,すき家 札幌駅前店,北海道,北海道札幌市北区北6条西4丁目1`;

type Chain = { id: number; name: string; category: string; emoji: string | null; storeCount: number };
type Store = { id: number; chainId: number; chainName: string; name: string; prefecture: string; address: string; lat: number | null; lng: number | null; geocoded: boolean };
type StoreList = { stores: Store[]; totalCount: number; page: number; size: number };
type ImportHistory = { id: number; filename: string; totalCount: number; successCount: number; errorCount: number; status: string; importedAt: string };
type ImportResult = { totalCount: number; successCount: number; errorCount: number; status: string; errors: string[] };
type ParsedRow = { chain_name: string; store_name: string; prefecture: string; address: string; _error?: boolean };

type Tab = "csv" | "stores" | "chains" | "history";

function parseCSV(text: string): { rows: ParsedRow[]; errors: string[] } {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return { rows: [], errors: ["データがありません"] };
  const header = lines[0].split(",").map((h) => h.trim());
  const required = ["chain_name", "store_name", "prefecture", "address"];
  const missing = required.filter((r) => !header.includes(r));
  if (missing.length > 0) return { rows: [], errors: [`必須カラムがありません: ${missing.join(", ")}`] };

  const rows: ParsedRow[] = [];
  const errors: string[] = [];
  lines.slice(1).forEach((line, i) => {
    if (!line.trim()) return;
    const vals = line.split(",").map((v) => v.trim());
    const row = Object.fromEntries(header.map((h, idx) => [h, vals[idx] ?? ""])) as ParsedRow;
    const rowErrs: string[] = [];
    if (!row.chain_name) rowErrs.push("chain_name が空");
    if (!row.store_name) rowErrs.push("store_name が空");
    if (!row.prefecture) rowErrs.push("prefecture が空");
    if (!row.address) rowErrs.push("address が空");
    if (rowErrs.length > 0) { errors.push(`行${i + 2}: ${rowErrs.join(", ")}`); row._error = true; }
    rows.push(row);
  });
  return { rows, errors };
}

export default function DestinationAdminPage() {
  const [tab, setTab] = useState<Tab>("csv");
  const [chains, setChains] = useState<Chain[]>([]);
  const [storeList, setStoreList] = useState<StoreList | null>(null);
  const [history, setHistory] = useState<ImportHistory[]>([]);
  const [storeSearch, setStoreSearch] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [chainModal, setChainModal] = useState<"add" | Chain | null>(null);
  const [chainForm, setChainForm] = useState({ name: "", category: "", emoji: "" });
  const [csvText, setCsvText] = useState("");
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchChains = useCallback(() => {
    fetch(`${API}/api/admin/destinations/chains`).then((r) => r.json()).then(setChains).catch(() => {});
  }, []);

  const fetchStores = useCallback((search = storeSearch) => {
    const params = new URLSearchParams({ search, page: "0", size: "50" });
    fetch(`${API}/api/admin/destinations/stores?${params}`).then((r) => r.json()).then(setStoreList).catch(() => {});
  }, [storeSearch]);

  const fetchHistory = useCallback(() => {
    fetch(`${API}/api/admin/destinations/import/histories`).then((r) => r.json()).then(setHistory).catch(() => {});
  }, []);

  useEffect(() => {
    fetchChains();
    fetchStores();
    fetchHistory();
  }, [fetchChains, fetchStores, fetchHistory]);

  const handleCSV = (text: string) => {
    setCsvText(text);
    const { rows, errors } = parseCSV(text);
    setParsedRows(rows);
    setParseErrors(errors);
    setImportResult(null);
  };

  const handleFile = (file: File | null | undefined) => {
    if (!file?.name.endsWith(".csv")) return;
    const reader = new FileReader();
    reader.onload = (e) => handleCSV(e.target?.result as string);
    reader.readAsText(file, "UTF-8");
  };

  const handleImport = () => {
    const validRows = parsedRows.filter((r) => !r._error);
    if (validRows.length === 0 || !csvText) return;
    setImporting(true);
    const blob = new Blob([csvText], { type: "text/csv" });
    const form = new FormData();
    form.append("file", blob, "import.csv");
    fetch(`${API}/api/admin/destinations/import`, { method: "POST", body: form })
      .then((r) => r.json())
      .then((d: ImportResult) => {
        setImportResult(d);
        setParsedRows([]);
        setCsvText("");
        fetchStores();
        fetchHistory();
      })
      .catch(() => {})
      .finally(() => setImporting(false));
  };

  const handleDeleteStore = (id: number) => {
    fetch(`${API}/api/admin/destinations/stores/${id}`, { method: "DELETE" })
      .then(() => { setDeleteConfirm(null); fetchStores(); })
      .catch(() => {});
  };

  const saveChain = () => {
    if (!chainForm.name || !chainForm.category) return;
    const isEdit = chainModal !== "add" && chainModal !== null;
    const url = isEdit ? `${API}/api/admin/destinations/chains/${(chainModal as Chain).id}` : `${API}/api/admin/destinations/chains`;
    fetch(url, { method: isEdit ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(chainForm) })
      .then(() => { setChainModal(null); fetchChains(); })
      .catch(() => {});
  };

  const TABS: { id: Tab; label: string }[] = [
    { id: "csv", label: "CSV投入" },
    { id: "stores", label: "店舗一覧" },
    { id: "chains", label: "チェーン管理" },
    { id: "history", label: "インポート履歴" },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <div className={styles.topBarLeft}>
          <span className={styles.topBarIcon}>🗺</span>
          <div>
            <div className={styles.topBarTitle}>どこ行く？ 管理画面</div>
            <div className={styles.topBarSub}>destination roulette admin</div>
          </div>
        </div>
        <div className={styles.stats}>
          <Stat label="チェーン" value={chains.length} />
          <Stat label="店舗" value={storeList?.totalCount ?? 0} />
        </div>
      </div>

      <div className={styles.tabs}>
        {TABS.map((t) => (
          <button key={t.id} className={`${styles.tab} ${tab === t.id ? styles.tabActive : ""}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      <div className={styles.body}>
        {tab === "csv" && (
          <div>
            <div className={styles.sectionTitle}>CSVファイルを投入</div>
            <div className={styles.formatHint}>
              <div className={styles.formatLabel}>CSVフォーマット</div>
              <pre className={styles.formatPre}>{`chain_name,store_name,prefecture,address\n山岡家,山岡家 ○○店,栃木,栃木県○○市...\n※ lat/lngは住所から自動変換されます`}</pre>
              <button className={styles.sampleBtn} onClick={() => handleCSV(SAMPLE_CSV)}>サンプルを読み込む</button>
            </div>

            <div
              className={`${styles.dropZone} ${dragOver ? styles.dropZoneActive : ""}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
              onClick={() => fileRef.current?.click()}
            >
              <div className={styles.dropIcon}>📂</div>
              <div className={styles.dropText}>CSVファイルをドロップ、またはクリックして選択</div>
              <div className={styles.dropNote}>UTF-8 / Shift-JIS 対応</div>
              <input ref={fileRef} type="file" accept=".csv" className={styles.fileInput} onChange={(e) => handleFile(e.target.files?.[0])} />
            </div>

            {parseErrors.length > 0 && (
              <div className={styles.errorBox}>
                <div className={styles.errorBoxTitle}>⚠ バリデーションエラー</div>
                {parseErrors.map((e, i) => <div key={i} className={styles.errorLine}>{e}</div>)}
              </div>
            )}

            {parsedRows.length > 0 && (
              <div>
                <div className={styles.previewHeader}>
                  <span className={styles.previewCount}>
                    {parsedRows.length}件を読み込み
                    {parseErrors.length > 0 && <span className={styles.errorCount}>（{parseErrors.length}件エラー）</span>}
                  </span>
                  <button className={styles.clearBtn} onClick={() => { setParsedRows([]); setCsvText(""); setParseErrors([]); setImportResult(null); }}>クリア</button>
                </div>
                <div className={styles.tableWrap}>
                  <table className={styles.table}>
                    <thead><tr className={styles.thead}>
                      {["チェーン", "店舗名", "都道府県", "住所", ""].map((h) => <th key={h} className={styles.th}>{h}</th>)}
                    </tr></thead>
                    <tbody>
                      {parsedRows.map((row, i) => (
                        <tr key={i} className={`${styles.tr} ${row._error ? styles.trError : ""}`}>
                          <td className={styles.td}>{row.chain_name}</td>
                          <td className={styles.td}>{row.store_name}</td>
                          <td className={`${styles.td} ${styles.tdMuted}`}>{row.prefecture}</td>
                          <td className={`${styles.td} ${styles.tdAddress}`}>{row.address}</td>
                          <td className={styles.td}>{row._error ? <span className={styles.statusError}>✗</span> : <span className={styles.statusOk}>✓</span>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className={styles.importFooter}>
                  <button onClick={handleImport} disabled={importing || parsedRows.filter((r) => !r._error).length === 0} className={`${styles.importBtn} ${importing ? styles.importBtnDisabled : ""}`}>
                    {importing ? "インポート中..." : `✓ ${parsedRows.filter((r) => !r._error).length}件をインポート`}
                  </button>
                </div>
              </div>
            )}

            {importResult && (
              <div className={importResult.status === "failed" ? styles.resultFail : styles.resultSuccess}>
                {importResult.status === "failed" ? (
                  <>
                    <div className={styles.resultIcon}>⚠</div>
                    <div className={styles.resultMsg}>インポートに失敗しました</div>
                    {importResult.errors.map((e, i) => <div key={i} className={styles.resultDetail}>{e}</div>)}
                  </>
                ) : (
                  <>
                    <div className={styles.resultIcon}>🎉</div>
                    <div className={styles.resultMsg}>{importResult.successCount}件をインポートしました</div>
                    {importResult.errorCount > 0 && <div className={styles.resultDetail}>{importResult.errorCount}件はエラーでスキップされました</div>}
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {tab === "stores" && (
          <div>
            <div className={styles.sectionTitle}>店舗一覧 <span className={styles.countBadge}>（{storeList?.totalCount ?? 0}件）</span></div>
            <input value={storeSearch} onChange={(e) => { setStoreSearch(e.target.value); fetchStores(e.target.value); }} placeholder="店舗名・チェーン名・都道府県で検索..." className={styles.searchInput} />
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead><tr className={styles.thead}>
                  {["チェーン", "店舗名", "都道府県", "住所", ""].map((h) => <th key={h} className={styles.th}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {(storeList?.stores ?? []).map((store) => (
                    <tr key={store.id} className={styles.tr}>
                      <td className={styles.td}><span className={styles.chainBadge}>{store.chainName}</span></td>
                      <td className={styles.td}>{store.name}</td>
                      <td className={`${styles.td} ${styles.tdMuted}`}>{store.prefecture}</td>
                      <td className={`${styles.td} ${styles.tdAddress}`}>{store.address}</td>
                      <td className={styles.td}>
                        {deleteConfirm === store.id ? (
                          <span className={styles.confirmRow}>
                            <span className={styles.confirmText}>本当に？</span>
                            <button onClick={() => handleDeleteStore(store.id)} className={styles.dangerBtn}>削除</button>
                            <button onClick={() => setDeleteConfirm(null)} className={styles.cancelBtnSm}>戻す</button>
                          </span>
                        ) : (
                          <button onClick={() => setDeleteConfirm(store.id)} className={styles.deleteBtn}>削除</button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {(storeList?.stores ?? []).length === 0 && (
                    <tr><td colSpan={5} className={styles.emptyRow}>該当する店舗がありません</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "chains" && (
          <div>
            <div className={styles.chainHeader}>
              <div className={styles.sectionTitle}>チェーン管理</div>
              <button className={styles.addChainBtn} onClick={() => { setChainForm({ name: "", category: "", emoji: "" }); setChainModal("add"); }}>＋ チェーンを追加</button>
            </div>
            <div className={styles.chainList}>
              {chains.map((chain) => (
                <div key={chain.id} className={styles.chainCard}>
                  <span className={styles.chainEmoji}>{chain.emoji}</span>
                  <div className={styles.chainInfo}>
                    <div className={styles.chainName}>{chain.name}</div>
                    <div className={styles.chainMeta}>{chain.category} · {chain.storeCount}店舗</div>
                  </div>
                  <button className={styles.editBtn} onClick={() => { setChainForm({ name: chain.name, category: chain.category, emoji: chain.emoji ?? "" }); setChainModal(chain); }}>編集</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "history" && (
          <div>
            <div className={styles.sectionTitle}>インポート履歴</div>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead><tr className={styles.thead}>
                  {["日時", "ファイル名", "件数", "ステータス"].map((h) => <th key={h} className={styles.th}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {history.map((h) => (
                    <tr key={h.id} className={styles.tr}>
                      <td className={`${styles.td} ${styles.tdMuted}`} style={{ whiteSpace: "nowrap" }}>{h.importedAt}</td>
                      <td className={`${styles.td} ${styles.tdMono}`}>{h.filename}</td>
                      <td className={`${styles.td} ${styles.tdMuted}`}>{h.totalCount}件</td>
                      <td className={styles.td}>
                        {h.status === "success"
                          ? <span className={styles.statusOk}>✓ 成功</span>
                          : h.status === "partial"
                            ? <span className={styles.statusWarn}>⚠ 一部エラー（{h.errorCount}件）</span>
                            : <span className={styles.statusError}>✗ 失敗</span>}
                      </td>
                    </tr>
                  ))}
                  {history.length === 0 && <tr><td colSpan={4} className={styles.emptyRow}>履歴がありません</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {chainModal !== null && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalTitle}>{chainModal === "add" ? "チェーンを追加" : "チェーンを編集"}</div>
            {[{ key: "name", label: "チェーン名", placeholder: "例: 山岡家" }, { key: "emoji", label: "絵文字", placeholder: "例: 🍜" }].map((f) => (
              <div key={f.key} className={styles.formGroup}>
                <label className={styles.formLabel}>{f.label}</label>
                <input value={chainForm[f.key as keyof typeof chainForm]} onChange={(e) => setChainForm((p) => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder} className={styles.formInput} />
              </div>
            ))}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>カテゴリ</label>
              <select value={chainForm.category} onChange={(e) => setChainForm((p) => ({ ...p, category: e.target.value }))} className={styles.formSelect}>
                <option value="">選択してください</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className={styles.modalFooter}>
              <button onClick={() => setChainModal(null)} className={styles.cancelBtn}>キャンセル</button>
              <button onClick={saveChain} disabled={!chainForm.name || !chainForm.category} className={`${styles.saveBtn} ${!chainForm.name || !chainForm.category ? styles.saveBtnDisabled : ""}`}>保存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className={styles.stat}>
      <div className={styles.statValue}>{value}</div>
      <div className={styles.statLabel}>{label}</div>
    </div>
  );
}
