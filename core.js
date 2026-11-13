(function (root) {
  'use strict';
  const strategies = ['reciprocal', 'contributor', 'relaxer', 'unpredictable'];
  function payoff(you, partner) {
    if (!['C','D'].includes(you) || !['C','D'].includes(partner)) throw new Error('Invalid choice');
    return you === 'C' ? (partner === 'C' ? [3,3] : [0,5]) : (partner === 'C' ? [5,0] : [1,1]);
  }
  function partnerChoice(strategy, history, random = Math.random) {
    if (strategy === 'contributor') return 'C';
    if (strategy === 'relaxer') return 'D';
    if (strategy === 'unpredictable') return random() < .5 ? 'C' : 'D';
    if (strategy === 'reciprocal') return history.length ? history[history.length - 1].you : 'C';
    throw new Error('Invalid strategy');
  }
  function createGame(options = {}, random = Math.random) {
    const strategy = strategies.includes(options.strategy) ? options.strategy : strategies[Math.floor(random() * strategies.length)];
    const game = {version:1, strategy, limit:Number.isInteger(options.rounds) && options.rounds >= 4 && options.rounds <= 20 ? options.rounds : 8 + Math.floor(random() * 3), avatar:options.avatar || '🌷', history:[], phase:'choice', response:null, reason:''};
    game.pending = partnerChoice(strategy, game.history, random);
    return game;
  }
  function choose(game, you) {
    if (game.phase !== 'choice' || game.history.length >= game.limit) return false;
    const partner = game.pending;
    const [yourPoints, partnerPoints] = payoff(you, partner);
    game.history.push({you, partner, yourPoints, partnerPoints});
    game.pending = null;
    game.phase = 'result';
    return true;
  }
  function advance(game, random = Math.random) {
    if (game.phase !== 'result') return false;
    if (game.history.length >= game.limit) { game.phase = 'twist'; return true; }
    game.pending = partnerChoice(game.strategy, game.history, random);
    game.phase = 'choice';
    return true;
  }
  function totals(game) { return game.history.reduce((a,r) => ({you:a.you+r.yourPoints, partner:a.partner+r.partnerPoints, yourChores:a.yourChores+(r.you==='C'), partnerChores:a.partnerChores+(r.partner==='C')}), {you:0,partner:0,yourChores:0,partnerChores:0}); }
  function valid(game) {
    if (!game || game.version !== 1 || !strategies.includes(game.strategy) || !Number.isInteger(game.limit) || game.limit < 4 || game.limit > 20 || !Array.isArray(game.history) || game.history.length > game.limit || !['choice','result','twist','done'].includes(game.phase)) return false;
    if (game.phase === 'choice' && (game.history.length >= game.limit || !['C','D'].includes(game.pending))) return false;
    if (game.phase === 'result' && !game.history.length) return false;
    if (['twist','done'].includes(game.phase) && game.history.length !== game.limit) return false;
    if (game.phase === 'done' && !['A','B','C','D'].includes(game.response)) return false;
    return game.history.every(r => { try { const p = payoff(r.you,r.partner); return r.yourPoints === p[0] && r.partnerPoints === p[1]; } catch { return false; } });
  }
  const api = {strategies,payoff,partnerChoice,createGame,choose,advance,totals,valid};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.ChoreGame = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
