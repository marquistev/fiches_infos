/* Flashcards à répétition espacée. Usage : <div class="card fc" id="flashcards" data-chapitre="ch04"></div>
   + <script src="cartes-ch04.js"> (définit window.CARTES.ch04) + ce fichier. */
(function () {
  'use strict';
  var KEY = 'fiches.cartes.v1', NOMS = ['Rouge', 'Orange', 'Jaune', 'Vert'], mem = {};

  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return mem; } }
  function save(d) { mem = d; try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) {} }
  function iso(d) { return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function today() { return iso(new Date()); }
  function plus(n) { var d = new Date(); d.setDate(d.getDate() + n); return iso(d); }
  function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function fmt(s) { return esc(s).replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\n/g, '<br>'); }
  function lbl(j) { return j < 30 ? j + ' j' : Math.round(j / 30) + ' mois'; }

  /* Planning inspiré de SM-2. g : 0 rouge, 1 orange, 2 jaune, 3 vert. e : état de la carte (ou undefined). */
  function suivant(e, g) {
    var i = e ? e.i : 0, ef = e ? e.ef : 2.5;
    if (g === 0) return { i: 1, ef: Math.max(1.3, ef - 0.2) };
    var r = i === 0 ? [0, 1, 2, 4][g] : Math.max(i + 1, Math.round(i * [0, 1.2, ef, ef * 1.3][g]));
    return { i: r, ef: g === 1 ? Math.max(1.3, ef - 0.05) : g === 3 ? ef + 0.1 : ef };
  }

  function mount(root) {
    var cartes = (window.CARTES || {})[root.dataset.chapitre] || [];
    var data = load(), file = [], cur = null, stats = [0, 0, 0, 0], actif = false, montre = false;

    function dues() { var t = today(); return cartes.filter(function (c) { return data[c.id] && data[c.id].due <= t; }); }
    function nouvelles() { return cartes.filter(function (c) { return !data[c.id]; }); }

    function accueil(msg) {
      actif = false;
      var d = dues(), nv = nouvelles(), vus = cartes.filter(function (c) { return data[c.id]; });
      var proch = vus.map(function (c) { return data[c.id].due; }).sort()[0];
      var dots = cartes.map(function (c) {
        var e = data[c.id], g = e && e.h.length ? e.h[e.h.length - 1][1] : -1;
        return '<span class="fc-dot' + (g >= 0 ? ' fc-g' + g : '') + '" title="' + esc(c.q.slice(0, 70)) + '"></span>';
      }).join('');
      root.innerHTML =
        '<div class="fc-stats"><span><strong>' + d.length + '</strong> à revoir</span><span><strong>' + nv.length +
        '</strong> nouvelles</span><span><strong>' + cartes.length + '</strong> cartes</span></div>' +
        '<div class="fc-dots" aria-label="Dernière note de chaque carte">' + dots + '</div>' +
        (d.length + nv.length === 0 && proch ? '<p>Rien à revoir aujourd’hui. Prochaine révision : ' + proch + '.</p>' : '') +
        '<div class="fc-btns"><button data-a="due"' + (d.length + nv.length ? '' : ' disabled') + '>Réviser (' +
        (d.length + Math.min(nv.length, 10)) + ')</button><button data-a="all">Tout le chapitre</button></div>' +
        '<div class="fc-btns fc-small"><button data-a="exp">Exporter ma progression</button><button data-a="imp">Importer</button>' +
        '<input type="file" accept=".json" hidden></div><p class="fc-msg" role="status">' + (msg || '') + '</p>';
    }

    function demarrer(liste) { file = liste; stats = [0, 0, 0, 0]; actif = true; suite(); }
    function suite() { if (!file.length) return fin(); cur = file[0]; montre = false; carte(); }

    function carte() {
      var e = data[cur.id], rep = '';
      if (montre) {
        rep = '<div class="fc-a">' + fmt(cur.a) + '</div><div class="fc-grade">' + [0, 1, 2, 3].map(function (g) {
          return '<button class="fc-g' + g + '" data-g="' + g + '"><span>' + (g + 1) + ' · ' + NOMS[g] + '</span><small>' +
            (g ? lbl(suivant(e, g).i) : 'maintenant') + '</small></button>';
        }).join('') + '</div>';
      } else rep = '<div class="fc-btns"><button data-a="show">Afficher la réponse</button></div>';
      root.innerHTML = '<div class="fc-top"><span>Reste : ' + file.length + '</span><button data-a="quit">Quitter</button></div>' +
        '<div class="fc-q">' + fmt(cur.q) + (cur.c ? ' <span class="bonus-tag">complément</span>' : '') + '</div>' + rep;
    }

    function noter(g) {
      var e = data[cur.id] || { i: 0, ef: 2.5, h: [] }, n = suivant(e, g);
      e.i = n.i; e.ef = n.ef; e.due = g === 0 ? today() : plus(n.i); e.t = Date.now();
      e.h.push([today(), g]); if (e.h.length > 30) e.h.shift();
      data[cur.id] = e; save(data); stats[g]++;
      file.shift();
      if (g === 0) file.splice(Math.min(3, file.length), 0, cur);   /* rouge : revient dans 3 cartes */
      suite();
    }

    function fin() {
      actif = false;
      root.innerHTML = '<p><strong>Séance terminée.</strong></p><div class="fc-stats">' + [0, 1, 2, 3].map(function (g) {
        return '<span><i class="fc-dot fc-g' + g + '"></i> ' + NOMS[g] + ' : ' + stats[g] + '</span>';
      }).join('') + '</div><div class="fc-btns"><button data-a="home">Retour</button></div>';
    }

    function exporter() {
      var b = new Blob([JSON.stringify({ v: 1, data: load() })], { type: 'application/json' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(b); a.download = 'progression-fiches-' + today() + '.json'; a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
    }
    function importer(f) {
      var r = new FileReader();
      r.onload = function () {
        try {
          var inc = JSON.parse(r.result).data, d = load();
          Object.keys(inc).forEach(function (k) { if (!d[k] || (inc[k].t || 0) > (d[k].t || 0)) d[k] = inc[k]; });
          save(d); data = d; accueil('Progression importée.');
        } catch (err) { accueil('Fichier invalide.'); }
      };
      r.readAsText(f);
    }

    root.addEventListener('click', function (ev) {
      var b = ev.target.closest('button'); if (!b) return;
      if (b.dataset.g !== undefined) return noter(+b.dataset.g);
      var a = b.dataset.a;
      if (a === 'show') { montre = true; carte(); }
      else if (a === 'quit' || a === 'home') accueil();
      else if (a === 'due') demarrer(dues().concat(nouvelles().slice(0, 10)));
      else if (a === 'all') demarrer(cartes.slice().sort(function () { return Math.random() - 0.5; }));
      else if (a === 'exp') exporter();
      else if (a === 'imp') root.querySelector('input[type=file]').click();
    });
    root.addEventListener('change', function (ev) { if (ev.target.type === 'file' && ev.target.files[0]) importer(ev.target.files[0]); });
    document.addEventListener('keydown', function (ev) {
      if (!actif || ev.ctrlKey || ev.metaKey || ev.altKey) return;
      if (ev.key === ' ' && !montre) { ev.preventDefault(); montre = true; carte(); }
      else if (montre && '1234'.indexOf(ev.key) >= 0 && ev.key) noter(+ev.key - 1);
    });
    accueil();
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.fc[data-chapitre]').forEach(mount);
  });
})();
