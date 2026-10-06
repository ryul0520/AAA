const $ = (s) => document.querySelector(s);

const input = $("#recordInput");
const charCount = $("#charCount");
const analysisSection = $("#analysisSection");
const questionSection = $("#questionSection");
const practiceSection = $("#practiceSection");
const analysisBox = $("#analysis");
const questionsBox = $("#questions");
const category = $("#category");
const answer = $("#answer");
const currentQuestion = $("#currentQuestion");
const timerEl = $("#timer");
const savedAnswers = $("#savedAnswers");

let questions = [];
let selectedQuestion = "";
let timerId = null;
let seconds = 0;

input.addEventListener("input", () => {
  charCount.textContent = `${input.value.length.toLocaleString()}자`;
});

$("#fileInput").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  if (file.size > 10 * 1024 * 1024) {
    alert("10MB 이하의 TXT 파일만 사용할 수 있습니다.");
    return;
  }
  input.value = await file.text();
  input.dispatchEvent(new Event("input"));
});

$("#analyzeBtn").addEventListener("click", analyze);
category.addEventListener("change", renderQuestions);

function cleanText(s) {
  return s.replace(/\r/g,"")
    .replace(/[ \t]+/g," ")
    .replace(/\n{3,}/g,"\n\n")
    .trim();
}

function splitSentences(text) {
  return cleanText(text)
    .split(/(?<=[.!?。！？])\s+|\n+/)
    .map(x => x.replace(/^[-•·▪◦]\s*/,"").trim())
    .filter(x => x.length >= 12);
}

function keywords(text) {
  const stop = new Set(["그리고","또한","통해","대한","위해","사용","활동","과정","관련","대해","에서","으로","있는","하였다","했다","하는","것을","통한","대한"]);
  const words = (text.match(/[가-힣A-Za-z][가-힣A-Za-z0-9·\-]{1,}/g) || [])
    .map(x => x.toLowerCase())
    .filter(x => x.length >= 2 && !stop.has(x));
  const count = {};
  words.forEach(w => count[w]=(count[w]||0)+1);
  return Object.entries(count).sort((a,b)=>b[1]-a[1]).slice(0,12).map(x=>x[0]);
}

function findActivities(sentences) {
  const patterns = ["탐구","연구","프로젝트","실험","분석","개발","제작","동아리","대회","발표","보고서","앱","모델","코딩","프로그램","R&E","멘토","봉사","수상"];
  return sentences.filter(s => patterns.some(p=>s.includes(p))).slice(0,8);
}

function makeQuestions(text, sentences, keys) {
  const qs = [];
  const add = (category, text) => qs.push({category,text});

  const acts = findActivities(sentences);
  acts.slice(0,7).forEach(s => {
    add("activity", `"${shorten(s,90)}"라는 활동에서 본인이 직접 맡은 역할과 가장 중요하게 한 일을 설명해 주세요.`);
    add("concept", `"${shorten(s,70)}"에서 사용한 핵심 개념이나 원리를 면접관에게 설명해 주세요.`);
    add("reflection", `이 활동에서 예상대로 되지 않았던 점은 무엇이었고, 어떻게 해결했나요?`);
  });

  keys.slice(0,6).forEach(k => {
    add("follow", `"${k}"에 대해 더 깊이 탐구한다면 어떤 변수를 추가하거나 방법을 바꾸겠습니까?`);
  });

  add("career", "여러 활동 중 본인의 진로와 가장 밀접하게 연결되는 활동은 무엇이며, 그 이유는 무엇인가요?");
  add("career", "고등학교에서의 탐구 경험이 대학에서 어떤 전공 공부로 이어질 수 있다고 생각하나요?");
  add("reflection", "생기부에 기록된 활동을 다시 한다면 가장 먼저 개선하고 싶은 부분은 무엇인가요?");
  add("activity", "생기부에 적힌 활동의 결과보다 그 과정에서 본인이 실제로 한 행동을 구체적으로 설명해 주세요.");

  // 중복 제거
  return [...new Map(qs.map(q=>[q.category+"|"+q.text,q])).values()].slice(0,40);
}

function shorten(s,n) {
  return s.length > n ? s.slice(0,n-1)+"…" : s;
}

function analyze() {
  const text = cleanText(input.value);
  if (text.length < 30) {
    alert("생기부 내용을 30자 이상 입력해 주세요.");
    return;
  }

  const sentences = splitSentences(text);
  const keys = keywords(text);
  const acts = findActivities(sentences);

  analysisBox.innerHTML = `
    <div class="grid">
      <div class="info"><h3>핵심 키워드</h3><p>${keys.length ? keys.map(escapeHtml).join(" · ") : "추출된 키워드가 없습니다."}</p></div>
      <div class="info"><h3>문장 수</h3><p>${sentences.length}개의 문장을 분석했습니다.</p></div>
      <div class="info"><h3>면접에서 확인할 활동</h3><ul>${(acts.length ? acts.slice(0,5) : ["탐구·활동 관련 문장을 찾지 못했습니다."]).map(x=>`<li>${escapeHtml(shorten(x,120))}</li>`).join("")}</ul></div>
      <div class="info"><h3>추천 답변 구조</h3><p><b>상황 → 본인의 행동 → 이유/원리 → 결과 → 한계 → 배운 점 → 확장</b> 순서로 말하면 활동을 구체적으로 설명하기 좋습니다.</p></div>
    </div>`;

  questions = makeQuestions(text,sentences,keys);
  analysisSection.classList.remove("hidden");
  questionSection.classList.remove("hidden");
  practiceSection.classList.remove("hidden");
  renderQuestions();
  window.scrollTo({top:analysisSection.offsetTop-15,behavior:"smooth"});
}

function renderQuestions() {
  const selected = category.value;
  const list = selected==="all" ? questions : questions.filter(q=>q.category===selected);
  const names = {activity:"활동·과정",concept:"개념·원리",reflection:"한계·배운 점",follow:"꼬리질문",career:"진로·전공"};
  questionsBox.innerHTML = list.map((q,i)=>`
    <div class="q">
      <div class="q-top">
        <span class="badge">${names[q.category]}</span>
        <div class="q-text">${escapeHtml(q.text)}</div>
        <button onclick='selectQuestion(${JSON.stringify(q.text)})'>연습</button>
      </div>
    </div>`).join("");
}

window.selectQuestion = function(q) {
  selectedQuestion = q;
  currentQuestion.textContent = q;
  answer.focus();
  window.scrollTo({top:practiceSection.offsetTop-15,behavior:"smooth"});
};

$("#saveAnswerBtn").addEventListener("click",()=>{
  if(!selectedQuestion){alert("먼저 연습할 질문을 선택하세요.");return;}
  if(!answer.value.trim()){alert("답변을 입력하세요.");return;}
  const box=document.createElement("div");
  box.className="saved";
  box.innerHTML=`<b>Q.</b> ${escapeHtml(selectedQuestion)}<br><br><b>A.</b> ${escapeHtml(answer.value.trim())}`;
  savedAnswers.prepend(box);
  answer.value="";
});

$("#timerBtn").addEventListener("click",()=>{
  if(timerId){
    clearInterval(timerId); timerId=null; $("#timerBtn").textContent="스톱워치 시작";
  } else {
    timerId=setInterval(()=>{
      seconds++;
      const m=String(Math.floor(seconds/60)).padStart(2,"0");
      const s=String(seconds%60).padStart(2,"0");
      timerEl.textContent=`${m}:${s}`;
    },1000);
    $("#timerBtn").textContent="스톱워치 정지";
  }
});

$("#clearBtn").addEventListener("click",()=>{
  if(!confirm("입력한 내용과 연습 기록을 모두 지울까요?")) return;
  input.value=""; charCount.textContent="0자"; analysisSection.classList.add("hidden");
  questionSection.classList.add("hidden"); practiceSection.classList.add("hidden");
  questions=[]; savedAnswers.innerHTML=""; answer.value="";
  selectedQuestion=""; currentQuestion.textContent="질문을 선택하세요.";
  if(timerId){clearInterval(timerId);timerId=null;}
  seconds=0;timerEl.textContent="00:00";$("#timerBtn").textContent="스톱워치 시작";
});

function escapeHtml(s){
  return s.replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
}
