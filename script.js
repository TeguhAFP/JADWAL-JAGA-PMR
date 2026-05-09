// --- Data Storage Lokal ---
let members = JSON.parse(localStorage.getItem('pmr_members')) || [];
let schedules = JSON.parse(localStorage.getItem('pmr_schedules')) || [];
let currentSchedule = schedules.length > 0 ? schedules[0] : null;

let formData = {
  date: '',
  groups: [
    { name: '10.1-10.7', members: ['', '', ''] },
    { name: '10.8-10.13', members: ['', '', ''] },
    { name: '11.1-11.7', members: ['', '', ''] },
    { name: '11.8-11.14', members: ['', '', ''] },
    { name: '12.1-12.7', members: ['', '', ''] },
    { name: '12.8-12.14', members: ['', '', ''] },
  ],
  rsps: ['', ''],
  tandu: ['', '', '', ''],
  notes: '• Wajib membawa minyak kayu putih\n• Membawa SYALER\n• Bagi RSPS membawa gunting\n• Setelah upacara selesai kembali lagi kumpul depan uks'
};

// --- Inisialisasi Aplikasi ---
function initApp() {
  renderMembersList();
  renderCreateForm();
  renderHistoryList();
  renderPoster();
}

// --- Simpan ke Memori Browser ---
function saveData() {
  localStorage.setItem('pmr_members', JSON.stringify(members));
  localStorage.setItem('pmr_schedules', JSON.stringify(schedules));
}

// --- Navigasi Tab ---
function switchTab(tabId) {
  ['preview', 'create', 'members', 'history'].forEach(id => {
    document.getElementById(`view-${id}`).classList.add('hidden');
    const btn = document.getElementById(`tab-${id}`);
    btn.className = `flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap text-gray-500`;
  });
  
  document.getElementById(`view-${tabId}`).classList.remove('hidden');
  const activeBtn = document.getElementById(`tab-${tabId}`);
  
  if (tabId === 'preview') activeBtn.classList.add('bg-white', 'text-pink-600', 'shadow-sm');
  if (tabId === 'create') activeBtn.classList.add('bg-white', 'text-purple-600', 'shadow-sm');
  if (tabId === 'members') activeBtn.classList.add('bg-white', 'text-orange-600', 'shadow-sm');
  if (tabId === 'history') activeBtn.classList.add('bg-white', 'text-blue-600', 'shadow-sm');

  if(tabId === 'preview') renderPoster();
}

// --- Logika Anggota ---
function addMember() {
  const input = document.getElementById('new-member-name');
  const name = input.value.trim();
  if (!name) return;
  
  members.push({ id: Date.now().toString(), name: name, dutyCount: 0 });
  members.sort((a, b) => a.name.localeCompare(b.name));
  saveData();
  input.value = '';
  renderMembersList();
  renderCreateForm();
}

function deleteMember(id) {
  members = members.filter(m => m.id !== id);
  saveData();
  renderMembersList();
  renderCreateForm();
}

function renderMembersList() {
  const container = document.getElementById('members-list');
  if (members.length === 0) {
    container.innerHTML = `<div class="text-center py-8 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">Belum ada anggota terdaftar. Tambahkan di atas!</div>`;
    return;
  }

  container.innerHTML = members.map(m => `
    <div class="flex items-center justify-between p-4 bg-pink-50 rounded-xl border border-pink-100">
      <span class="font-medium text-gray-800">${m.name}</span>
      <div class="flex items-center gap-4">
        <span class="bg-white px-3 py-1 rounded-full text-sm font-bold text-pink-600 shadow-sm">${m.dutyCount}x Jaga</span>
        <button onclick="deleteMember('${m.id}')" class="text-red-400 hover:text-red-600 p-1"><i class="fas fa-trash-alt"></i></button>
      </div>
    </div>
  `).join('');
}

// --- Logika Form Jadwal ---
function getSelectHtml(currentValue, onChangeAttr) {
  let options = `<option value="">- Pilih Anggota -</option>`;
  members.forEach(m => {
    const selected = m.id === currentValue ? 'selected' : '';
    options += `<option value="${m.id}" ${selected}>${m.name} (${m.dutyCount}x jaga)</option>`;
  });
  return `<select onchange="${onChangeAttr}" class="w-full p-2 border border-gray-200 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-pink-300">${options}</select>`;
}

function renderCreateForm() {
  document.getElementById('form-date').value = formData.date;
  document.getElementById('form-date').oninput = (e) => formData.date = e.target.value;
  document.getElementById('form-notes').value = formData.notes;
  document.getElementById('form-notes').oninput = (e) => formData.notes = e.target.value;

  document.getElementById('form-groups-container').innerHTML = formData.groups.map((group, gIdx) => `
    <div class="bg-purple-50 p-4 rounded-xl border border-purple-100">
      <input type="text" value="${group.name}" oninput="updateGroupName(${gIdx}, this.value)" class="w-full text-center font-bold text-purple-800 bg-transparent border-b-2 border-purple-200 mb-3 pb-1 focus:outline-none">
      <div class="space-y-2">
        ${group.members.map((memId, mIdx) => `
          <div class="flex gap-2 items-center">
            <span class="text-xs font-bold text-purple-400 w-4">${mIdx + 1}.</span>
            ${getSelectHtml(memId, `updateGroupMember(${gIdx}, ${mIdx}, this.value)`)}
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');

  document.getElementById('form-rsps-container').innerHTML = formData.rsps.map((memId, mIdx) => `
    <div class="flex gap-2 items-center">
      <span class="text-xs font-bold text-orange-400 w-4">${mIdx + 1}.</span>
      ${getSelectHtml(memId, `updateSpecialMember('rsps', ${mIdx}, this.value)`)}
    </div>
  `).join('');

  document.getElementById('form-tandu-container').innerHTML = formData.tandu.map((memId, mIdx) => `
    <div class="flex gap-2 items-center">
      <span class="text-xs font-bold text-cyan-400 w-4">${mIdx + 1}.</span>
      ${getSelectHtml(memId, `updateSpecialMember('tandu', ${mIdx}, this.value)`)}
    </div>
  `).join('');
}

function updateGroupName(gIdx, val) { formData.groups[gIdx].name = val; }
function updateGroupMember(gIdx, mIdx, val) { formData.groups[gIdx].members[mIdx] = val; }
function updateSpecialMember(type, mIdx, val) { formData[type][mIdx] = val; }

function saveSchedule() {
  if (!formData.date) {
    alert("Mohon isi tanggal/judul jadwal terlebih dahulu!");
    return;
  }

  const getMemberInfo = (id) => {
    const m = members.find(mem => mem.id === id);
    return m ? { id: m.id, name: m.name } : { id: '', name: '' };
  };

  const finalSchedule = {
    id: Date.now().toString(),
    date: formData.date,
    createdAt: Date.now(),
    groups: formData.groups.map(g => ({ name: g.name, members: g.members.map(getMemberInfo) })),
    rsps: formData.rsps.map(getMemberInfo),
    tandu: formData.tandu.map(getMemberInfo),
    notes: formData.notes
  };

  schedules.unshift(finalSchedule); // Masukkan di paling atas
  currentSchedule = finalSchedule;

  // Update hitungan jaga
  const allSelectedIds = [...formData.groups.flatMap(g => g.members), ...formData.rsps, ...formData.tandu].filter(id => id !== '');
  allSelectedIds.forEach(id => {
    let member = members.find(m => m.id === id);
    if (member) member.dutyCount += 1;
  });

  saveData();
  
  // Reset form
  formData.date = '';
  formData.groups.forEach(g => g.members = ['', '', '']);
  formData.rsps = ['', ''];
  formData.tandu = ['', '', '', ''];
  
  renderMembersList();
  renderCreateForm();
  renderHistoryList();
  switchTab('preview');
  alert("Jadwal berhasil disimpan! Hitungan jaga anggota telah ditambahkan.");
}

// --- Logika Riwayat ---
function renderHistoryList() {
  const container = document.getElementById('history-list');
  if (schedules.length === 0) {
    container.innerHTML = `<div class="text-center py-10 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">Belum ada jadwal yang dibuat.</div>`;
    return;
  }

  container.innerHTML = schedules.map(sched => `
    <div class="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-100 gap-4">
      <div>
        <h3 class="font-bold text-gray-800 text-lg">${sched.date}</h3>
        <p class="text-sm text-gray-500">Dibuat pada ${new Date(sched.createdAt).toLocaleDateString('id-ID')}</p>
      </div>
      <button onclick="viewHistorySchedule('${sched.id}')" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
        Lihat Poster <i class="fas fa-chevron-right text-xs"></i>
      </button>
    </div>
  `).join('');
}

function viewHistorySchedule(id) {
  currentSchedule = schedules.find(s => s.id === id);
  switchTab('preview');
}

// --- Render Poster ---
function renderPoster() {
  const msgArea = document.getElementById('no-schedule-msg');
  const posterArea = document.getElementById('poster-area');
  const container = document.getElementById('poster-canvas-container');

  if (!currentSchedule) {
    msgArea.classList.remove('hidden');
    posterArea.classList.add('hidden');
    return;
  }

  msgArea.classList.add('hidden');
  posterArea.classList.remove('hidden');

  const getName = (obj) => obj && obj.name ? obj.name : '......';
  const sched = currentSchedule;

  const colors = [
    { head: 'bg-pink-300', body: 'bg-pink-50 text-pink-900' },
    { head: 'bg-orange-200', body: 'bg-indigo-50 text-indigo-900' },
    { head: 'bg-orange-300', body: 'bg-orange-50 text-orange-900' },
    { head: 'bg-indigo-300', body: 'bg-indigo-50 text-indigo-900' },
    { head: 'bg-pink-400', body: 'bg-pink-50 text-pink-900' },
    { head: 'bg-teal-300', body: 'bg-teal-50 text-teal-900' }
  ];

  let groupsHtml = sched.groups.map((g, idx) => {
    const color = colors[idx % colors.length];
    const memsHtml = g.members.map((m, i) => `<div class="text-lg leading-relaxed font-medium">${i+1}. ${getName(m)}</div>`).join('');
    const star = idx === 2 ? `<div class="absolute -right-6 top-4 text-3xl z-30">⭐</div>` : '';
    
    return `
      <div class="relative">
        <div class="${color.head} rounded-full py-1 text-center font-bold text-lg mb-[-15px] relative z-20 shadow-sm border-2 border-white">${g.name}</div>
        <div class="${color.body} rounded-xl pt-6 pb-3 px-4 shadow-sm border-2 border-white min-h-[100px]">
          ${memsHtml}
        </div>
        ${star}
      </div>
    `;
  }).join('');

  let rspsHtml = sched.rsps.map((m, i) => `<div class="text-lg leading-relaxed font-medium">${i+1}. ${getName(m)}</div>`).join('');
  let tanduHtml = sched.tandu.map((m, i) => `<div class="text-lg leading-relaxed font-medium">${i+1}. ${getName(m)}</div>`).join('');

  container.innerHTML = `
    <div id="poster-canvas" class="font-cute bg-grid-paper border border-gray-200 shadow-xl relative overflow-hidden" style="width: 850px; min-height: 600px; padding: 40px;">
      <div class="absolute inset-4 border-2 border-gray-300 z-0 opacity-50"></div>
      
      <div class="relative z-10 flex justify-between items-center mb-8">
        <h1 class="text-4xl tracking-wide font-bold text-purple-500 drop-shadow-sm">JADWAL PIKET PMR!!!</h1>
        <div class="bg-white border-4 border-pink-100 rounded-full px-8 py-2 shadow-sm relative">
          <span class="text-xl">Tanggal: ${sched.date}</span>
          <div class="absolute -right-6 -bottom-4 text-3xl opacity-80">☁️</div>
        </div>
      </div>

      <div class="relative z-10 grid grid-cols-4 gap-4 mb-6">${groupsHtml}</div>

      <div class="relative z-10 grid grid-cols-4 gap-4">
        <div class="relative">
          <div class="bg-orange-200 rounded-full py-1 text-center font-bold text-lg mb-[-15px] relative z-20 shadow-sm border-2 border-white">RSPS</div>
          <div class="bg-indigo-50 rounded-xl pt-6 pb-3 px-4 shadow-sm border-2 border-white min-h-[100px]">${rspsHtml}</div>
        </div>

        <div class="relative">
          <div class="bg-cyan-400 rounded-full py-1 text-center font-bold text-lg mb-[-15px] relative z-20 shadow-sm border-2 border-white">TANDU</div>
          <div class="bg-gray-100 rounded-xl pt-6 pb-3 px-4 shadow-sm border-2 border-white min-h-[130px]">${tanduHtml}</div>
        </div>

        <div class="relative col-span-2">
          <div class="bg-pink-300 rounded-full w-1/2 mx-auto py-1 text-center font-bold text-xl mb-[-15px] relative z-20 shadow-sm border-2 border-white">Catatan</div>
          <div class="bg-pink-100 rounded-3xl pt-8 pb-6 px-6 shadow-sm border-2 border-white relative h-full">
            <div class="absolute -right-8 -top-8 text-7xl drop-shadow-md z-30">☀️</div>
            <div class="text-lg whitespace-pre-wrap leading-relaxed text-center">${sched.notes}</div>
            <div class="absolute -bottom-8 -left-4 text-5xl">🚑</div>
            <div class="absolute -bottom-6 right-4 text-5xl">🩹</div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// --- Download Poster ---
async function downloadImage(btn) {
  const canvasElement = document.getElementById('poster-canvas');
  if (canvasElement && window.html2canvas) {
    try {
      const originalText = btn.innerHTML;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses...';
      
      const canvas = await html2canvas(canvasElement, { scale: 2, backgroundColor: null, useCORS: true });
      const link = document.createElement('a');
      link.download = `Jadwal-PMR-${currentSchedule?.date || 'Baru'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      btn.innerHTML = originalText;
    } catch (err) {
      alert("Gagal mengunduh gambar.");
    }
  }
}
