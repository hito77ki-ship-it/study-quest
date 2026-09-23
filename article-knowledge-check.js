(() => {
  'use strict';

  const CHECKS = {
    'boki2-kessan.html': {
      title: '決算整理・財務諸表作成',
      questions: [
        { id: 'ending-inventory', prompt: '三分法で売上原価を求めるとき、期末商品はどう扱いますか？', choices: ['期首商品に足す', '当期仕入から差し引く', '売上に足す'], answer: 1, correct: '正解です。期末商品はまだ売れていないため、当期に売れた商品の原価から外します。', incorrect: 'もう一度。期末商品は、決算日時点で残っている「まだ売れていない商品」です。' },
        { id: 'adjusted-trial-balance', prompt: '決算整理仕訳を反映した後、財務諸表を作る前に確かめる表はどれですか？', choices: ['決算整理後残高試算表', '仕入帳', '現金出納帳'], answer: 0, correct: '正解です。決算整理後残高試算表で、修正後の各勘定の残高を確かめてから財務諸表を作ります。', incorrect: 'もう一度。決算整理の結果を集め、財務諸表を作る直前に残高を確認する表を思い出してみましょう。' }
      ]
    },
    'boki2-shohin-baibai.html': {
      title: '商品売買・棚卸資産',
      questions: [
        { id: 'inventory-shortage', prompt: '帳簿上は商品が100個、実地棚卸では98個でした。数量の不足として先に考えるのはどれですか？', choices: ['棚卸減耗損', '商品評価損', '売上値引'], answer: 0, correct: '正解です。帳簿の数量と実地棚卸の数量の差から、まず棚卸減耗損を考えます。', incorrect: 'もう一度。ここで分かっているのは「価値の下落」ではなく、帳簿より実物が少ないという数量の差です。' },
        { id: 'valuation-loss-quantity', prompt: '商品評価損を計算するとき、数量の基準にするのはどれですか？', choices: ['帳簿上の数量', '実地棚卸で確認した数量', '当期の仕入数量'], answer: 1, correct: '正解です。実地棚卸で確認した数量を基準にして、評価額の下落を計算します。', incorrect: 'もう一度。数量の不足を反映した後に、残っている実物について価値の下落を考えます。' }
      ]
    }
  };

  const page = window.location.pathname.split('/').pop() || 'index.html';
  const check = CHECKS[page];
  const slot = document.querySelector('[data-sq-knowledge-check]');
  if (!check || !slot) return;

  const storageKey = `sq_article_knowledge_check_v1_${page}`;
  const safeRead = () => {
    try {
      const saved = JSON.parse(window.localStorage.getItem(storageKey) || '{}');
      return saved && typeof saved.answers === 'object' ? saved.answers : {};
    } catch (_) { return {}; }
  };
  const save = (answers) => {
    try { window.localStorage.setItem(storageKey, JSON.stringify({ answers, updatedAt: new Date().toISOString() })); } catch (_) { /* 画面内だけで続行 */ }
  };

  const ensureStyles = () => {
    if (document.getElementById('sq-knowledge-check-styles')) return;
    const style = document.createElement('style');
    style.id = 'sq-knowledge-check-styles';
    style.textContent = `
      .sq-knowledge-check{margin:40px 0;padding:24px;border:1px solid var(--sq-border,#D8E1D5);border-radius:16px;background:var(--sq-surface-soft,#F4F8F2);color:var(--sq-text,#1A202C)}
      .sq-knowledge-check__eyebrow{margin:0 0 6px;font-size:12px;font-weight:700;letter-spacing:.08em;color:var(--sq-accent,#587D20)}
      .sq-knowledge-check h2{margin:0 0 8px;padding:0;border:0;color:inherit;font-size:21px;line-height:1.45}
      .sq-knowledge-check__intro{margin:0 0 22px;color:var(--sq-soft,#52645A);font-size:14px;line-height:1.75}
      .sq-knowledge-check__question{margin:16px 0 0;padding:18px;border:1px solid var(--sq-border,#D8E1D5);border-radius:12px;background:var(--sq-surface,#FFFFFF)}
      .sq-knowledge-check__question-title{margin:0 0 12px;font-size:15px;font-weight:700;line-height:1.7;color:inherit}
      .sq-knowledge-check__choices{display:grid;gap:8px}
      .sq-knowledge-check__choice{width:100%;padding:11px 12px;border:1px solid var(--sq-border,#C9D5C4);border-radius:9px;background:var(--sq-surface,#FFFFFF);color:inherit;text-align:left;font:inherit;font-size:14px;line-height:1.55;cursor:pointer;box-shadow:0 1px 0 rgba(17,40,20,.08);transition:transform 140ms ease,background 140ms ease,border-color 140ms ease,box-shadow 140ms ease}
      .sq-knowledge-check__choice:hover{border-color:var(--sq-accent,#6E982A);box-shadow:0 3px 0 rgba(65,98,31,.16)}
      .sq-knowledge-check__choice:focus-visible,.sq-knowledge-check__reset:focus-visible{outline:3px solid var(--sq-focus,#2F80ED);outline-offset:3px}
      .sq-knowledge-check__choice:active{transform:translateY(1px);box-shadow:none}
      .sq-knowledge-check__choice.is-correct{border-color:var(--sq-success,#40823A);background:var(--sq-success-soft,#EAF6E6);font-weight:700}
      .sq-knowledge-check__choice.is-incorrect{border-color:var(--sq-danger,#B85A4F);background:var(--sq-danger-soft,#FFF1EF)}
      .sq-knowledge-check__feedback{min-height:1.7em;margin:12px 0 0;font-size:14px;line-height:1.7;color:var(--sq-soft,#52645A)}
      .sq-knowledge-check__feedback.is-correct{color:var(--sq-success-text,#286322);font-weight:700}.sq-knowledge-check__feedback.is-incorrect{color:var(--sq-danger-text,#943E35)}
      .sq-knowledge-check__summary{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:20px 0 0;padding-top:18px;border-top:1px solid var(--sq-border,#D8E1D5);font-size:14px;font-weight:700}
      .sq-knowledge-check__reset{border:0;border-bottom:1px solid currentColor;padding:3px 0;background:transparent;color:var(--sq-accent,#587D20);font:inherit;font-size:13px;cursor:pointer}.sq-knowledge-check__next{margin:12px 0 0;font-size:14px;font-weight:700;color:var(--sq-success-text,#286322)}
      @media (max-width:640px){.sq-knowledge-check{margin:32px 0;padding:18px}.sq-knowledge-check__summary{align-items:flex-start;flex-direction:column}.sq-knowledge-check h2{font-size:19px}}
      @media (prefers-reduced-motion:reduce){.sq-knowledge-check__choice{transition:none}.sq-knowledge-check__choice:active{transform:none}}
    `;
    document.head.appendChild(style);
  };

  const render = () => {
    ensureStyles();
    const answers = safeRead();
    slot.innerHTML = '';
    const section = document.createElement('section');
    section.className = 'sq-knowledge-check';
    section.setAttribute('aria-labelledby', 'sq-knowledge-check-title');
    section.innerHTML = `<p class="sq-knowledge-check__eyebrow">KNOWLEDGE CHECK</p><h2 id="sq-knowledge-check-title">理解チェック：${check.title}</h2><p class="sq-knowledge-check__intro">読み終えたら2問だけ。この記事で扱った考え方を、自分の言葉で説明できるか確かめましょう。</p><div data-sq-questions></div><div class="sq-knowledge-check__summary"><span data-sq-summary></span><button class="sq-knowledge-check__reset" type="button">もう一度解く</button></div><p class="sq-knowledge-check__next" data-sq-next hidden></p>`;
    const questionsNode = section.querySelector('[data-sq-questions]');
    const summary = section.querySelector('[data-sq-summary]');
    const next = section.querySelector('[data-sq-next]');
    const updateSummary = () => {
      const completed = check.questions.filter((question) => answers[question.id] === question.answer).length;
      summary.textContent = `${check.questions.length}問中 ${completed}問正解`;
      next.hidden = completed !== check.questions.length;
      next.textContent = completed === check.questions.length ? '全問正解です。次は、なぜその答えになるかを一文で説明してみましょう。' : '';
    };
    check.questions.forEach((question, index) => {
      const questionNode = document.createElement('section');
      questionNode.className = 'sq-knowledge-check__question';
      questionNode.innerHTML = `<p class="sq-knowledge-check__question-title">Q${index + 1}. ${question.prompt}</p><div class="sq-knowledge-check__choices" role="group" aria-label="問題${index + 1}の選択肢"></div><p class="sq-knowledge-check__feedback" role="status" aria-live="polite"></p>`;
      const choicesNode = questionNode.querySelector('.sq-knowledge-check__choices');
      const feedback = questionNode.querySelector('.sq-knowledge-check__feedback');
      const completed = answers[question.id] === question.answer;
      question.choices.forEach((choice, choiceIndex) => {
        const button = document.createElement('button');
        button.type = 'button'; button.className = 'sq-knowledge-check__choice'; button.textContent = choice;
        if (completed && choiceIndex === question.answer) { button.classList.add('is-correct'); button.setAttribute('aria-label', `${choice}（正解済み）`); }
        button.addEventListener('click', () => {
          if (answers[question.id] === question.answer) return;
          choicesNode.querySelectorAll('button').forEach((item) => { item.classList.remove('is-correct', 'is-incorrect'); item.removeAttribute('aria-label'); });
          if (choiceIndex === question.answer) {
            answers[question.id] = choiceIndex; save(answers); button.classList.add('is-correct'); button.setAttribute('aria-label', `${choice}（正解）`);
            choicesNode.querySelectorAll('button').forEach((item) => { item.disabled = true; });
            feedback.className = 'sq-knowledge-check__feedback is-correct'; feedback.textContent = question.correct; updateSummary();
          } else { button.classList.add('is-incorrect'); feedback.className = 'sq-knowledge-check__feedback is-incorrect'; feedback.textContent = question.incorrect; }
        });
        choicesNode.appendChild(button);
      });
      if (completed) choicesNode.querySelectorAll('button').forEach((item) => { item.disabled = true; });
      if (completed) { feedback.className = 'sq-knowledge-check__feedback is-correct'; feedback.textContent = question.correct; }
      questionsNode.appendChild(questionNode);
    });
    section.querySelector('.sq-knowledge-check__reset').addEventListener('click', () => { try { window.localStorage.removeItem(storageKey); } catch (_) { /* no-op */ } render(); });
    updateSummary(); slot.appendChild(section);
  };
  render();
})();
