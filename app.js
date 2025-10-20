const MV = document.getElementById('mv')
const hotspotList = document.getElementById('hotspotList')
const info = document.getElementById('info')
const fields = document.querySelector('.fields')
const labelEl = document.getElementById('label')
const painEl = document.getElementById('pain')
const afterEl = document.getElementById('aftercare')
const healEl = document.getElementById('heal')
const saveBtn = document.getElementById('save')
const clearBtn = document.getElementById('clear')
const deleteBtn = document.getElementById('delete')
const addBtn = document.getElementById('addHotspot')
const exportBtn = document.getElementById('export')
const importFile = document.getElementById('importFile')

// Example hotspots with normalized coordinates (spherical or using position attribute)
// These positions are approximate; adjust per your model using model-viewer inspector or trial-and-error.
const defaultHotspots = [
  { id:'hp1', name:'Left shoulder', position:'0.15m 0.65m 0.05m' },
  { id:'hp2', name:'Right shoulder', position:'-0.15m 0.65m 0.05m' },
  { id:'hp3', name:'Lower back', position:'0m 0.28m -0.12m' },
  { id:'hp4', name:'Left forearm', position:'0.18m 0.45m 0.02m' }
]

function loadHotspots(){
  const stored = localStorage.getItem('bodymap_hotspots')
  return stored ? JSON.parse(stored) : defaultHotspots.map(h=>({...h, meta:{label:h.name,pain:'',aftercare:'',heal:''}}))
}

function saveHotspots(hs){
  localStorage.setItem('bodymap_hotspots', JSON.stringify(hs))
}

let hotspots = loadHotspots()
let active = null

function renderHotspots(){
  // remove existing hotspots in DOM
  const existing = MV.querySelectorAll('[slot^="hotspot-"]')
  existing.forEach(n=>n.remove())

  hotspots.forEach(h=>{
    const btn = document.createElement('button')
    btn.className = 'mv-hotspot'
    btn.slot = `hotspot-${h.id}`
    btn.style.pointerEvents = 'auto'
    btn.dataset.id = h.id
    // model-viewer accepts a <button slot="hotspot-N" data-position="x y z" data-normal="...">
    btn.setAttribute('data-position', h.position)
    btn.setAttribute('data-normal', '0 1 0')
    btn.title = h.meta?.label || h.name

    btn.addEventListener('click', (ev)=>{
      ev.stopPropagation()
      openEditor(h.id)
    })

    MV.appendChild(btn)
  })

  renderList()
}

function renderList(){
  hotspotList.innerHTML = ''
  hotspots.forEach(h=>{
    const li = document.createElement('li')
    const title = document.createElement('span')
    title.textContent = h.meta?.label || h.name
    const edit = document.createElement('div')
    edit.style.display = 'flex'
    edit.style.gap = '6px'
    const editBtn = document.createElement('button')
    editBtn.textContent = 'Edit'
    editBtn.style.background='transparent'
    editBtn.style.border='1px solid rgba(255,255,255,0.04)'
    editBtn.style.color='var(--muted)'
    editBtn.addEventListener('click', ()=>openEditor(h.id))
    const goto = document.createElement('button')
    goto.textContent = 'Go'
    goto.style.background='var(--accent)'
    goto.addEventListener('click', ()=>{
      // center camera to hotspot - approximate by setting target via camera-orbit? model-viewer has 'jumpCameraToGoal'
      try{ MV.jumpCameraToGoal && MV.jumpCameraToGoal({goal: {objectId: h.id}}) }catch(e){}
    })
    edit.appendChild(editBtn)
    edit.appendChild(goto)
    li.appendChild(title)
    li.appendChild(edit)
    hotspotList.appendChild(li)
  })
}

function openEditor(id){
  active = hotspots.find(h=>h.id===id)
  if(!active) return
  info.querySelector('.hint').classList.add('hidden')
  fields.classList.remove('hidden')
  labelEl.value = active.meta.label || ''
  painEl.value = active.meta.pain || ''
  afterEl.value = active.meta.aftercare || ''
  healEl.value = active.meta.heal || ''
}

saveBtn.addEventListener('click', ()=>{
  if(!active) return
  active.meta.label = labelEl.value
  active.meta.pain = painEl.value
  active.meta.aftercare = afterEl.value
  active.meta.heal = healEl.value
  saveHotspots(hotspots)
  renderList()
})

clearBtn.addEventListener('click', ()=>{
  if(!active) return
  active.meta = {label:'',pain:'',aftercare:'',heal:''}
  saveHotspots(hotspots)
  openEditor(active.id)
  renderList()
})

deleteBtn && deleteBtn.addEventListener('click', ()=>{
  if(!active) return
  hotspots = hotspots.filter(h=>h.id!==active.id)
  saveHotspots(hotspots)
  active = null
  fields.classList.add('hidden')
  info.querySelector('.hint').classList.remove('hidden')
  renderHotspots()
})

addBtn && addBtn.addEventListener('click', ()=>{
  // create a new hotspot at model center as default
  const id = 'hp' + Date.now().toString(36)
  const newH = { id, name: 'New hotspot', position: '0m 0.4m 0m', meta:{label:'New hotspot',pain:'',aftercare:'',heal:''} }
  hotspots.push(newH)
  saveHotspots(hotspots)
  renderHotspots()
  openEditor(id)
})

exportBtn && exportBtn.addEventListener('click', ()=>{
  const dataStr = JSON.stringify(hotspots, null, 2)
  const blob = new Blob([dataStr], {type: 'application/json'})
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'hotspots.json'
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
})

importFile && importFile.addEventListener('change', (e)=>{
  const f = e.target.files[0]
  if(!f) return
  const reader = new FileReader()
  reader.onload = ()=>{
    try{
      const parsed = JSON.parse(reader.result)
      if(Array.isArray(parsed)){
        hotspots = parsed
        saveHotspots(hotspots)
        renderHotspots()
      }else alert('Invalid JSON: expected an array of hotspots')
    }catch(err){alert('Failed to parse JSON')}
  }
  reader.readAsText(f)
})

// Initialize
renderHotspots()

// Optional: export JSON for backend
window.exportHotspots = ()=>JSON.stringify(hotspots, null, 2)
