import { useStore, getState } from '../store';
import { startGame, act, buy, closeMenu, closeSummary, MENU, coarsePointer } from '../game/life';

const fmt = (m) => String(Math.floor(m / 60) % 24).padStart(2, '0') + ':' + String(Math.floor(m) % 60).padStart(2, '0');
const naira = (n) => '₦' + n.toLocaleString('en-NG');

export default function Hud() {
  const s = useStore((x) => x);
  if (s.phase === 'loading') return null;
  return (
    <>
      {s.phase === 'play' && (
        <div className="top">
          <div className="chip"><b>{fmt(s.clock)}</b>{s.slot ? ' · Class: ' + s.slot : ' · Next: GST 101 08:00, MTH 101 14:00'}</div>
          <div className="chip">{naira(s.money)} · Energy {Math.round(s.energy)}% · Notes {s.notes}</div>
        </div>
      )}
      {s.subtitle && <div className="subtitle"><b>{s.subtitle.who}</b>{s.subtitle.text}</div>}
      {s.toast && <div className="toastx">{s.toast}</div>}
      {s.prompt && s.phase === 'play' && !s.menuOpen && <button className="prompt act" onClick={act}>{s.prompt}</button>}
      {s.phase === 'intro' && <Intro />}
      {s.menuOpen && (
        <div className="modal"><div className="introcard" role="dialog" aria-label="Cafeteria menu">
          <h1>Student Cafeteria</h1>
          <p>You have {naira(s.money)}. Prices are simulated.</p>
          <div className="menulist">{MENU.map((m, i) => <button key={m[0]} className="btn ghost wide" onClick={() => buy(i)}>{m[0]} <span>{naira(m[1])}</span></button>)}</div>
          <button className="btn primary wide" onClick={closeMenu}>Close</button>
        </div></div>
      )}
      {s.summary && (
        <div className="modal"><div className="introcard" role="dialog" aria-label="Day complete">
          <h1>Day complete!</h1>
          <p>You attended {s.lectures} lectures, collected {s.notes} notes, had lunch and finished at {fmt(s.clock)} with {naira(s.money)} left.</p>
          <button className="btn primary big" onClick={closeSummary}>Keep exploring</button>
        </div></div>
      )}
    </>
  );
}

function Intro() {
  const rows = coarsePointer
    ? [['Left thumb', 'Walk'], ['Right thumb', 'Look around'], ['Orange button', 'Enter, sit, order']]
    : [['W A S D', 'Walk (Shift to hurry)'], ['Mouse', 'Look around'], ['E', 'Enter, sit, order, eat'], ['G', 'Change graphics quality']];
  return (
    <div className="modal"><div className="introcard" role="dialog" aria-labelledby="introTitle">
      <h1 id="introTitle">UNIUYO Life</h1>
      <p>Spend a day at the University of Uyo. Walk the campus, sit in your lectures and have lunch at the cafeteria.</p>
      <dl className="controls">{rows.map(([k, v], i) => <div key={i}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
      <p>Goal: attend two lectures and eat lunch.</p>
      <button className="btn primary big" onClick={startGame}>Start my day</button>
      <p className="note">Timetable, courses and prices are simulated. Voices are generated live in your browser.</p>
    </div></div>
  );
}
