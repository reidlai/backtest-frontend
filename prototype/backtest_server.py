
#!/usr/bin/env python3
"""
BACKTEST PRO — Full Backend Server v3.0
Run: pip install flask flask-cors yfinance pandas pandas_ta numpy requests lxml html5lib beautifulsoup4
Then: python backtest_server.py
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import yfinance as yf
import pandas as pd
import pandas_ta as ta
import numpy as np
import traceback
import warnings
warnings.filterwarnings('ignore')

app = Flask(__name__)
CORS(app)

# ══════════════════════════════════════════════════════════
# INDICATOR CATALOGUE
# ══════════════════════════════════════════════════════════
INDICATOR_CATALOGUE = {
    "Trend": {
        "SMA":        {"func":"sma",       "params":[{"name":"length","default":20,"type":"int"}]},
        "EMA":        {"func":"ema",       "params":[{"name":"length","default":20,"type":"int"}]},
        "WMA":        {"func":"wma",       "params":[{"name":"length","default":20,"type":"int"}]},
        "DEMA":       {"func":"dema",      "params":[{"name":"length","default":20,"type":"int"}]},
        "TEMA":       {"func":"tema",      "params":[{"name":"length","default":20,"type":"int"}]},
        "HMA":        {"func":"hma",       "params":[{"name":"length","default":20,"type":"int"}]},
        "VWMA":       {"func":"vwma",      "params":[{"name":"length","default":20,"type":"int"}]},
        "ALMA":       {"func":"alma",      "params":[{"name":"length","default":20,"type":"int"}]},
        "SuperTrend": {"func":"supertrend","params":[{"name":"length","default":7,"type":"int"},{"name":"multiplier","default":3.0,"type":"float"}]},
        "PSAR":       {"func":"psar",      "params":[{"name":"af0","default":0.02,"type":"float"},{"name":"af","default":0.02,"type":"float"},{"name":"max_af","default":0.2,"type":"float"}]},
        "Ichimoku":   {"func":"ichimoku",  "params":[{"name":"tenkan","default":9,"type":"int"},{"name":"kijun","default":26,"type":"int"},{"name":"senkou","default":52,"type":"int"}]},
    },
    "Momentum": {
        "RSI":        {"func":"rsi",       "params":[{"name":"length","default":14,"type":"int"}]},
        "MACD":       {"func":"macd",      "params":[{"name":"fast","default":12,"type":"int"},{"name":"slow","default":26,"type":"int"},{"name":"signal","default":9,"type":"int"}]},
        "Stochastic": {"func":"stoch",     "params":[{"name":"k","default":14,"type":"int"},{"name":"d","default":3,"type":"int"},{"name":"smooth_k","default":3,"type":"int"}]},
        "StochRSI":   {"func":"stochrsi", "params":[{"name":"length","default":14,"type":"int"}]},
        "CCI":        {"func":"cci",       "params":[{"name":"length","default":20,"type":"int"}]},
        "MOM":        {"func":"mom",       "params":[{"name":"length","default":10,"type":"int"}]},
        "ROC":        {"func":"roc",       "params":[{"name":"length","default":10,"type":"int"}]},
        "Williams%R": {"func":"willr",     "params":[{"name":"length","default":14,"type":"int"}]},
        "CMF":        {"func":"cmf",       "params":[{"name":"length","default":20,"type":"int"}]},
        "UO":         {"func":"uo",        "params":[]},
        "AO":         {"func":"ao",        "params":[]},
        "PPO":        {"func":"ppo",       "params":[{"name":"fast","default":12,"type":"int"},{"name":"slow","default":26,"type":"int"}]},
        "DPO":        {"func":"dpo",       "params":[{"name":"length","default":20,"type":"int"}]},
        "TRIX":       {"func":"trix",      "params":[{"name":"length","default":18,"type":"int"}]},
        "KDJ":        {"func":"kdj",       "params":[{"name":"length","default":9,"type":"int"}]},
        "Fisher":     {"func":"fisher",    "params":[{"name":"length","default":9,"type":"int"}]},
        "Coppock":    {"func":"coppock",   "params":[]},
    },
    "Volatility": {
        "BollingerBands": {"func":"bbands","params":[{"name":"length","default":20,"type":"int"},{"name":"std","default":2.0,"type":"float"}]},
        "ATR":        {"func":"atr",       "params":[{"name":"length","default":14,"type":"int"}]},
        "NATR":       {"func":"natr",      "params":[{"name":"length","default":14,"type":"int"}]},
        "KeltnerChannel":{"func":"kc",     "params":[{"name":"length","default":20,"type":"int"}]},
        "DonchianChannel":{"func":"donchian","params":[{"name":"lower_length","default":20,"type":"int"},{"name":"upper_length","default":20,"type":"int"}]},
        "RVI":        {"func":"rvi",       "params":[{"name":"length","default":14,"type":"int"}]},
        "UI":         {"func":"ui",        "params":[{"name":"length","default":14,"type":"int"}]},
    },
    "Volume": {
        "OBV":        {"func":"obv",       "params":[]},
        "VWAP":       {"func":"vwap",      "params":[]},
        "AD":         {"func":"ad",        "params":[]},
        "ADOSC":      {"func":"adosc",     "params":[{"name":"fast","default":3,"type":"int"},{"name":"slow","default":10,"type":"int"}]},
        "MFI":        {"func":"mfi",       "params":[{"name":"length","default":14,"type":"int"}]},
        "EFI":        {"func":"efi",       "params":[{"name":"length","default":13,"type":"int"}]},
        "KVO":        {"func":"kvo",       "params":[]},
        "NVI":        {"func":"nvi",       "params":[]},
        "PVI":        {"func":"pvi",       "params":[]},
        "PVT":        {"func":"pvt",       "params":[]},
        "CMO":        {"func":"cmo",       "params":[{"name":"length","default":14,"type":"int"}]},
    },
    "Trend Strength": {
        "ADX":        {"func":"adx",       "params":[{"name":"length","default":14,"type":"int"}]},
        "AROON":      {"func":"aroon",     "params":[{"name":"length","default":25,"type":"int"}]},
        "Chop":       {"func":"chop",      "params":[{"name":"length","default":14,"type":"int"}]},
        "VHF":        {"func":"vhf",       "params":[{"name":"length","default":28,"type":"int"}]},
        "QStick":     {"func":"qstick",    "params":[{"name":"length","default":10,"type":"int"}]},
        "Mass":       {"func":"massi",     "params":[]},
    },
    "Candle Patterns": {
        "Doji":         {"func":"cdl_doji",        "params":[]},
        "Hammer":       {"func":"cdl_hammer",      "params":[]},
        "ShootingStar": {"func":"cdl_shootingstar","params":[]},
        "Engulfing":    {"func":"cdl_engulfing",   "params":[]},
        "MorningStar":  {"func":"cdl_morningstar", "params":[]},
        "EveningStar":  {"func":"cdl_eveningstar", "params":[]},
    },
}

# ══════════════════════════════════════════════════════════
# UNIVERSE DATA
# ══════════════════════════════════════════════════════════
_cache = {}

SP500_FALLBACK = [
    "AAPL","MSFT","NVDA","AMZN","META","GOOGL","GOOG","BRK-B","LLY","AVGO",
    "JPM","TSLA","UNH","XOM","V","PG","MA","COST","HD","JNJ","ABBV","MRK",
    "BAC","CRM","CVX","NFLX","AMD","ORCL","KO","WMT","PEP","LIN","DIS","CSCO",
    "ACN","MCD","ABT","TMO","ADBE","INTU","QCOM","TXN","GE","HON","AMGN","PFE",
    "NEE","UPS","LOW","IBM","AMAT","RTX","SPGI","GS","MS","ISRG","BLK","CAT",
    "MDLZ","DHR","SBUX","T","NOW","ELV","GILD","BMY","MU","C","DE","PLD","CI",
    "SYK","ADI","BKNG","REGN","ADP","MMC","TJX","ZTS","SCHW","CB","AMT","SO",
    "EOG","USB","VRTX","BSX","NOC","HCA","KLAC","LRCX","SHW","ICE","CME","COP",
    "INTC","PYPL","UBER","LYFT","SNAP","PINS","RBLX","COIN","HOOD","PLTR",
]
NASDAQ100_FALLBACK = [
    "AAPL","MSFT","NVDA","AMZN","META","GOOGL","GOOG","AVGO","TSLA","COST",
    "NFLX","AMD","ORCL","ADBE","INTU","QCOM","TXN","AMAT","MU","ISRG","BKNG",
    "GILD","REGN","VRTX","KLAC","LRCX","ADI","MRVL","CDNS","SNPS","MNST",
    "CTAS","IDXX","ROST","PAYX","PCAR","DXCM","BIIB","FAST","ODFL","EXC",
    "AEP","XEL","KDP","TTWO","DLTR","ILMN","HON","ON","FANG","GEHC","GFS",
]
HSI_FALLBACK = [
    "0700.HK","9988.HK","1299.HK","0005.HK","0939.HK","1398.HK","3988.HK",
    "2318.HK","0388.HK","2628.HK","0883.HK","1109.HK","2388.HK","0003.HK",
    "0006.HK","0011.HK","0012.HK","0017.HK","0019.HK","0027.HK","0066.HK",
    "0101.HK","0175.HK","0267.HK","0288.HK","0291.HK","0316.HK","0322.HK",
    "0386.HK","0489.HK","0669.HK","0688.HK","0762.HK","0823.HK","0836.HK",
    "0857.HK","0868.HK","0881.HK","0909.HK","0960.HK","0968.HK","1038.HK",
    "1044.HK","1093.HK","1113.HK","1177.HK","1211.HK","1288.HK","1378.HK",
    "1810.HK","1876.HK","1928.HK","2007.HK","2020.HK","2269.HK","2313.HK",
    "2382.HK","2689.HK","3328.HK","3690.HK","3968.HK","6098.HK","6862.HK",
    "9618.HK","9888.HK","9999.HK",
]
HK_ALL_FALLBACK = list(dict.fromkeys(HSI_FALLBACK + [
    "0001.HK","0002.HK","0004.HK","0008.HK","0013.HK","0016.HK","0020.HK",
    "0023.HK","0025.HK","0041.HK","0045.HK","0050.HK","0051.HK","0053.HK",
    "0060.HK","0069.HK","0083.HK","0087.HK","0088.HK","0099.HK","0107.HK",
    "0116.HK","0135.HK","0144.HK","0151.HK","0163.HK","0168.HK","0177.HK",
    "0182.HK","0193.HK","0210.HK","0215.HK","0216.HK","0220.HK","0222.HK",
    "0223.HK","0225.HK","0226.HK","0228.HK","0229.HK","0231.HK","0232.HK",
    "0234.HK","0238.HK","0240.HK","0242.HK","0245.HK","0247.HK","0253.HK",
    "0256.HK","0257.HK","0259.HK","0261.HK","0262.HK","0263.HK","0264.HK",
    "0268.HK","0270.HK","0272.HK","0273.HK","0276.HK","0278.HK","0280.HK",
    "0285.HK","0286.HK","0289.HK","0293.HK","0294.HK","0296.HK","0297.HK",
    "0299.HK","0303.HK","0330.HK","0338.HK","0345.HK","0347.HK","0351.HK",
    "0353.HK","0354.HK","0355.HK","0358.HK","0360.HK","0362.HK","0363.HK",
    "0365.HK","0367.HK","0369.HK","0371.HK","0373.HK","0374.HK","0375.HK",
    "0376.HK","0378.HK","0382.HK","0383.HK","0384.HK","0385.HK","0387.HK",
    "0390.HK","0392.HK","0395.HK","0396.HK","0398.HK","0399.HK","0400.HK",
    "0408.HK","0412.HK","0425.HK","0434.HK","0435.HK","0440.HK","0450.HK",
    "0460.HK","0467.HK","0468.HK","0480.HK","0483.HK","0484.HK","0486.HK",
    "0488.HK","0494.HK","0511.HK","0522.HK","0535.HK","0536.HK","0543.HK",
    "0548.HK","0551.HK","0552.HK","0553.HK","0555.HK","0563.HK","0564.HK",
    "0570.HK","0576.HK","0579.HK","0582.HK","0586.HK","0588.HK","0590.HK",
    "0592.HK","0596.HK","0598.HK","0600.HK","0606.HK","0607.HK","0608.HK",
]))


def fetch_sp500():
    if 'sp500' in _cache:
        return _cache['sp500']
    try:
        df = pd.read_html("https://en.wikipedia.org/wiki/List_of_S%26P_500_companies")[0]
        tickers = df['Symbol'].str.replace('.', '-', regex=False).tolist()
        _cache['sp500'] = tickers
        return tickers
    except:
        _cache['sp500'] = SP500_FALLBACK
        return SP500_FALLBACK

def fetch_nasdaq100():
    if 'nasdaq100' in _cache:
        return _cache['nasdaq100']
    try:
        dfs = pd.read_html("https://en.wikipedia.org/wiki/Nasdaq-100")
        for df in dfs:
            if 'Ticker' in df.columns:
                _cache['nasdaq100'] = df['Ticker'].tolist()
                return _cache['nasdaq100']
    except:
        pass
    _cache['nasdaq100'] = NASDAQ100_FALLBACK
    return NASDAQ100_FALLBACK


@app.route('/api/universe/<name>', methods=['GET'])
def get_universe(name):
    mapping = {
        'sp500':    fetch_sp500,
        'nasdaq100':fetch_nasdaq100,
        'hsi':      lambda: HSI_FALLBACK,
        'hk_all':   lambda: HK_ALL_FALLBACK,
    }
    fn = mapping.get(name.lower())
    if not fn:
        return jsonify({"error": f"Unknown universe: {name}"}), 404
    tickers = fn()
    return jsonify({"universe": name, "count": len(tickers), "tickers": tickers})

@app.route('/api/indicators', methods=['GET'])
def get_indicators():
    return jsonify(INDICATOR_CATALOGUE)

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({"status": "ok", "version": "3.0"})


# ══════════════════════════════════════════════════════════
# CORE ENGINE
# ══════════════════════════════════════════════════════════
def fetch_ohlcv(ticker, interval, period):
    df = yf.download(ticker, interval=interval, period=period,
                     auto_adjust=True, progress=False)
    if df is None or df.empty:
        return None
    if isinstance(df.columns, pd.MultiIndex):
        df.columns = df.columns.get_level_values(0)
    df = df[['Open','High','Low','Close','Volume']].copy()
    df.dropna(inplace=True)
    return df


def compute_indicators(df, indicators_config):
    HLC  = {'atr','natr','adx','aroon','psar','supertrend','kc','donchian',
            'cksp','uo','willr','stoch','stochrsi','kdj','fisher','cmf',
            'adosc','kvo','massi','vhf','chop','cci','efi','dmi',
            'cdl_doji','cdl_hammer','cdl_shootingstar','cdl_engulfing',
            'cdl_morningstar','cdl_eveningstar'}
    VOL  = {'obv','ad','pvt','nvi','pvi'}
    HLCV = {'mfi'}

    for ind in indicators_config:
        fname  = ind.get('func')
        params = {k: v for k, v in ind.get('params', {}).items()}
        if not fname:
            continue
        try:
            fn = getattr(ta, fname)
            if fname in HLCV:
                res = fn(df['High'], df['Low'], df['Close'], df['Volume'], **params)
            elif fname == 'vwap':
                res = fn(df['High'], df['Low'], df['Close'], df['Volume'])
            elif fname in VOL:
                res = fn(df['Close'], df['Volume'])
            elif fname in HLC:
                res = fn(df['High'], df['Low'], df['Close'], **params)
            else:
                try:
                    res = fn(df['Close'], **params)
                except:
                    res = fn(df['High'], df['Low'], df['Close'], **params)

            if isinstance(res, pd.DataFrame):
                for col in res.columns:
                    df[col] = res[col]
            elif isinstance(res, pd.Series):
                df[res.name if res.name else fname.upper()] = res
        except Exception as e:
            print(f"  [indicator skip] {fname}: {e}")

    df['OHLC4']      = (df['Open']+df['High']+df['Low']+df['Close'])/4
    df['HLC3']       = (df['High']+df['Low']+df['Close'])/3
    df['Prev_Close'] = df['Close'].shift(1)
    df['Prev_Open']  = df['Open'].shift(1)
    df['Prev_High']  = df['High'].shift(1)
    df['Prev_Low']   = df['Low'].shift(1)
    df.dropna(inplace=True)
    return df


def _eval_cond(row, cond):
    col = cond.get('column','Close')
    op  = cond.get('operator','>')
    val = cond.get('value', 0)
    if col not in row.index:
        return False
    lhs = float(row[col])
    try:
        rhs = float(val)
    except:
        rhs = float(row[val]) if val in row.index else 0.0
    return {'>':lhs>rhs,'<':lhs<rhs,'>=':lhs>=rhs,'<=':lhs<=rhs,
            '==':abs(lhs-rhs)<1e-9,'!=':abs(lhs-rhs)>=1e-9,
            'cross_above':lhs>rhs,'cross_below':lhs<rhs}.get(op, False)


def _eval_cond_list(row, conds):
    if not conds:
        return False
    result = _eval_cond(row, conds[0])
    for i in range(1, len(conds)):
        logic = conds[i].get('logic','AND').upper()
        curr  = _eval_cond(row, conds[i])
        result = result or curr if logic == 'OR' else result and curr
    return result


def _eval_expr(row, expr):
    if not expr or not expr.strip():
        return False
    env = {}
    for col in row.index:
        try:
            v = row[col]
            if pd.notna(v):
                env[col] = float(v)
        except:
            pass
    env.update({'abs':abs,'max':max,'min':min,'True':True,'False':False})
    try:
        return bool(eval(expr, {"__builtins__":{}}, env))
    except:
        return False


def _eval_code(df, code):
    ns = {'pd':pd,'np':np,'ta':ta}
    exec(compile(code, '<strategy>', 'exec'), ns)
    fn = ns.get('generate_signals')
    if not fn:
        raise RuntimeError("Code must define: generate_signals(df) -> (entry_series, exit_series)")
    entry, exit_ = fn(df.copy())
    return pd.Series(entry, index=df.index, dtype=bool), pd.Series(exit_, index=df.index, dtype=bool)


def generate_signals(df, body):
    mode     = body.get('strategy_mode', 'gui')
    cmode    = body.get('condition_mode', 'simple_and')
    entry_c  = body.get('entry_conditions', [])
    exit_c   = body.get('exit_conditions', [])
    entry_eg = body.get('entry_groups', [])
    exit_eg  = body.get('exit_groups', [])
    entry_ex = body.get('entry_expression', '')
    exit_ex  = body.get('exit_expression', '')

    if mode == 'code':
        return _eval_code(df, body.get('strategy_code', ''))

    n = len(df)
    ens = pd.Series([False]*n, index=df.index)
    exs = pd.Series([False]*n, index=df.index)

    for i, (idx, row) in enumerate(df.iterrows()):
        if cmode == 'expression':
            ens.iloc[i] = _eval_expr(row, entry_ex)
            exs.iloc[i] = _eval_expr(row, exit_ex)
        elif cmode == 'advanced_group':
            ens.iloc[i] = all(_eval_cond_list(row, g) for g in entry_eg) if entry_eg else _eval_cond_list(row, entry_c)
            exs.iloc[i] = all(_eval_cond_list(row, g) for g in exit_eg)  if exit_eg  else _eval_cond_list(row, exit_c)
        else:
            ens.iloc[i] = _eval_cond_list(row, entry_c)
            exs.iloc[i] = _eval_cond_list(row, exit_c)
    return ens, exs


def simulate(df, ens, exs, body):
    capital   = float(body.get('initial_capital', 100000))
    ptype     = body.get('position_size_type', 'fixed_pct')
    pval      = float(body.get('position_size_value', 10))
    comm      = float(body.get('commission_pct', 0.1)) / 100
    slip      = float(body.get('slippage_pct', 0.05)) / 100
    position  = 0
    ep        = 0.0
    trades    = []
    equity    = []
    held      = False

    for i, (idx, row) in enumerate(df.iterrows()):
        price = float(row['Close'])
        equity.append({'datetime':str(idx), 'equity':round(capital + position*price, 2)})

        if not held and ens.iloc[i]:
            bp = price * (1 + slip)
            sh = int(capital/bp) if ptype=='all_in' else \
                 int(pval/bp) if ptype=='fixed_amount' else \
                 int(capital*pval/100/bp)
            if sh > 0 and capital >= sh*bp:
                cost = sh*bp; fee = cost*comm
                capital -= cost+fee; position = sh; ep = bp; held = True
                trades.append({'type':'BUY','datetime':str(idx),'price':round(bp,4),
                               'shares':sh,'commission':round(fee,2),'capital_after':round(capital,2)})
        elif held and exs.iloc[i]:
            sp = price*(1-slip); proceeds = position*sp; fee = proceeds*comm
            pnl = proceeds - ep*position - fee
            capital += proceeds-fee
            trades.append({'type':'SELL','datetime':str(idx),'price':round(sp,4),
                           'shares':position,'commission':round(fee,2),
                           'pnl':round(pnl,2),'pnl_pct':round((sp/ep-1)*100,4),
                           'capital_after':round(capital,2)})
            position = 0; ep = 0.0; held = False

    if held:
        sp = float(df['Close'].iloc[-1])*(1-slip)
        proceeds = position*sp; fee = proceeds*comm
        pnl = proceeds - ep*position - fee
        capital += proceeds-fee
        trades.append({'type':'SELL (Close)','datetime':str(df.index[-1]),
                       'price':round(sp,4),'shares':position,'commission':round(fee,2),
                       'pnl':round(pnl,2),'pnl_pct':round((sp/ep-1)*100,4),
                       'capital_after':round(capital,2)})
    return trades, equity, capital


def calc_metrics(trades, equity_curve, initial_capital, interval):
    fin   = equity_curve[-1]['equity'] if equity_curve else initial_capital
    ret   = (fin-initial_capital)/initial_capital*100
    sells = [t for t in trades if 'SELL' in t['type']]
    wins  = [t for t in sells if t.get('pnl',0)>0]
    loss  = [t for t in sells if t.get('pnl',0)<=0]
    wr    = len(wins)/len(sells)*100 if sells else 0
    aw    = float(np.mean([t['pnl'] for t in wins])) if wins else 0
    al    = float(np.mean([t['pnl'] for t in loss])) if loss else 0
    gw    = sum(t['pnl'] for t in wins)
    gl    = abs(sum(t['pnl'] for t in loss))
    pf    = gw/gl if gl else (999 if gw>0 else 0)

    vals = [e['equity'] for e in equity_curve]
    peak = vals[0] if vals else initial_capital; mdd = 0
    for v in vals:
        if v>peak: peak=v
        dd=(peak-v)/peak*100
        if dd>mdd: mdd=dd

    rets = pd.Series(vals).pct_change().dropna()
    ann  = {'15m':252*26,'30m':252*13,'1h':252*7,'1d':252,'1wk':52}.get(interval,252)
    sh   = float(rets.mean()/rets.std()*np.sqrt(ann)) if len(rets)>1 and rets.std()>0 else 0
    nr   = rets[rets<0]
    so   = float(rets.mean()/nr.std()*np.sqrt(ann)) if len(nr)>0 and nr.std()>0 else 0
    yrs  = len(vals)/ann
    cagr = ((fin/initial_capital)**(1/yrs)-1)*100 if yrs>0 else 0
    cal  = cagr/mdd if mdd>0 else 0

    sw=sl=cw=cl=0
    for t in sells:
        if t.get('pnl',0)>0: cw+=1;cl=0;sw=max(sw,cw)
        else: cl+=1;cw=0;sl=max(sl,cl)

    return {
        "initial_capital":   initial_capital, "final_equity":round(fin,2),
        "total_return_pct":  round(ret,2),    "cagr_pct":round(cagr,2),
        "sharpe_ratio":      round(sh,3),     "sortino_ratio":round(so,3),
        "calmar_ratio":      round(cal,3),    "max_drawdown_pct":round(mdd,2),
        "total_trades":      len(sells),      "win_rate_pct":round(wr,2),
        "avg_win":           round(aw,2),     "avg_loss":round(al,2),
        "profit_factor":     round(pf,3),     "winning_trades":len(wins),
        "losing_trades":     len(loss),       "max_consec_wins":sw,
        "max_consec_losses": sl,              "gross_profit":round(gw,2),
        "gross_loss":        round(gl,2),
    }


def price_list(df):
    return [{'datetime':str(idx),'open':round(float(r['Open']),4),
             'high':round(float(r['High']),4),'low':round(float(r['Low']),4),
             'close':round(float(r['Close']),4),'volume':int(r['Volume'])}
            for idx,r in df.iterrows()]


# ══════════════════════════════════════════════════════════
# ENDPOINTS
# ══════════════════════════════════════════════════════════
@app.route('/api/run_backtest', methods=['POST'])
def run_backtest():
    body = request.json
    try:
        ticker = body['ticker'].upper()
        interval = body.get('interval','1d')
        period   = body.get('period','1y')
        df = fetch_ohlcv(ticker, interval, period)
        if df is None:
            return jsonify({"error": f"No data for {ticker}"}), 404
        df  = compute_indicators(df, body.get('indicators_config',[]))
        ens, exs = generate_signals(df, body)
        trades, equity, _ = simulate(df, ens, exs, body)
        metrics = calc_metrics(trades, equity, float(body.get('initial_capital',100000)), interval)
        return jsonify({"ticker":ticker,"metrics":metrics,"trades":trades,
                        "equity_curve":equity,"price_data":price_list(df),"columns":list(df.columns)})
    except RuntimeError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": str(e), "trace": traceback.format_exc()}), 500


@app.route('/api/run_portfolio_backtest', methods=['POST'])
def run_portfolio_backtest():
    body = request.json
    try:
        tickers  = [t.upper() for t in body.get('tickers',[])]
        weights  = body.get('weights', {})
        interval = body.get('interval','1d')
        period   = body.get('period','1y')
        init_cap = float(body.get('initial_capital',100000))
        if not tickers:
            return jsonify({"error":"No tickers"}), 400

        wsum = sum(float(weights.get(t,0)) for t in tickers)
        alloc = {t: float(weights.get(t,100/len(tickers))) if wsum>=1 else 100/len(tickers) for t in tickers}

        results = {}; combined = None
        for ticker in tickers:
            try:
                cap = init_cap * alloc[ticker]/100
                bt  = dict(body); bt['initial_capital'] = cap; bt['ticker'] = ticker
                df  = fetch_ohlcv(ticker, interval, period)
                if df is None:
                    results[ticker] = {"error":"No data"}; continue
                df  = compute_indicators(df, body.get('indicators_config',[]))
                ens, exs = generate_signals(df, bt)
                trades, equity, _ = simulate(df, ens, exs, bt)
                metrics = calc_metrics(trades, equity, cap, interval)
                results[ticker] = {"weight_pct":round(alloc[ticker],2),"metrics":metrics,
                                   "trades":trades,"equity_curve":equity}
                eq = pd.Series({e['datetime']:e['equity'] for e in equity})
                combined = eq.copy() if combined is None else combined.add(eq, fill_value=0)
            except Exception as e:
                results[ticker] = {"error":str(e)}

        if combined is not None and len(combined):
            cl  = [{'datetime':str(k),'equity':round(v,2)} for k,v in combined.items()]
            pm  = calc_metrics([], cl, init_cap, interval)
            pm['total_trades'] = sum(r.get('metrics',{}).get('total_trades',0) for r in results.values() if 'metrics' in r)
        else:
            cl = []; pm = {}

        return jsonify({"portfolio_equity_curve":cl,"portfolio_metrics":pm,"per_ticker":results})
    except Exception as e:
        return jsonify({"error":str(e),"trace":traceback.format_exc()}), 500


@app.route('/api/screen_universe', methods=['POST'])
def screen_universe():
    body = request.json
    try:
        uname     = body.get('universe','sp500')
        custom_t  = body.get('custom_tickers',[])
        rank_by   = body.get('rank_by','total_return_pct')
        max_t     = min(int(body.get('max_tickers',100)), 300)
        interval  = body.get('interval','1d')
        period    = body.get('period','1y')
        init_cap  = float(body.get('initial_capital',100000))

        tmap = {'sp500':fetch_sp500,'nasdaq100':fetch_nasdaq100,
                'hsi':lambda:HSI_FALLBACK,'hk_all':lambda:HK_ALL_FALLBACK}
        tickers = ([t.upper().strip() for t in custom_t if t.strip()]
                   if uname == 'custom' else tmap.get(uname, fetch_sp500)())[:max_t]

        results = []; errors = []
        for ticker in tickers:
            try:
                df = fetch_ohlcv(ticker, interval, period)
                if df is None or len(df) < 20:
                    errors.append({"ticker":ticker,"error":"Insufficient data"}); continue
                df   = compute_indicators(df, body.get('indicators_config',[]))
                bt   = dict(body); bt['initial_capital'] = init_cap
                ens, exs = generate_signals(df, bt)
                trades, equity, _ = simulate(df, ens, exs, bt)
                m = calc_metrics(trades, equity, init_cap, interval)
                results.append({"ticker":ticker,
                    **{k:m[k] for k in ['total_return_pct','cagr_pct','sharpe_ratio','sortino_ratio',
                                        'max_drawdown_pct','win_rate_pct','profit_factor',
                                        'total_trades','winning_trades','losing_trades','final_equity']}})
            except Exception as e:
                errors.append({"ticker":ticker,"error":str(e)})

        rev = rank_by != 'max_drawdown_pct'
        results.sort(key=lambda x: x.get(rank_by,0), reverse=rev)
        return jsonify({"universe":uname,"scanned":len(tickers),"qualified":len(results),
                        "rank_by":rank_by,"results":results,"errors":errors[:20]})
    except Exception as e:
        return jsonify({"error":str(e),"trace":traceback.format_exc()}), 500


@app.route('/api/validate_strategy', methods=['POST'])
def validate_strategy():
    body = request.json
    try:
        df = fetch_ohlcv(body.get('ticker','AAPL'), '1d', '60d')
        if df is None:
            return jsonify({"error":"Could not fetch data"}), 500
        df = compute_indicators(df, body.get('indicators_config',[]))
        ens, exs = _eval_code(df, body.get('strategy_code',''))
        return jsonify({"valid":True,"entry_signals":int(ens.sum()),"exit_signals":int(exs.sum()),
                        "rows":len(df),"columns":list(df.columns)})
    except Exception as e:
        return jsonify({"valid":False,"error":str(e)}), 400


if __name__ == '__main__':
    print("="*60)
    print("  BACKTEST PRO — Server v3.0  |  http://localhost:5000")
    print("="*60)
    app.run(debug=True, port=5000)