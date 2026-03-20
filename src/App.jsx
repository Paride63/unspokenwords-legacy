// force deploy
import { useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from './supabaseClient'
import LegalPage from './pages/LegalPage'
import TermsPage from './pages/TermsPage'
import PrivacyPage from './pages/PrivacyPage'
import CookiePage from './pages/CookiePage'

const uid = () => crypto.randomUUID()

const FREE_MEMORY_LIMIT = 2
const ADMIN_EMAILS = [
  'papiedo@gmail.com',
  'edoboccellari@gmail.com'
]

function safeJsonParse(value, fallback) {
  if (!value) return fallback
  try {
    return JSON.parse(value)
  } catch {
    return fallback
  }
}

async function uploadFileToBucket(bucket, item, folder = 'uploads') {
  if (!item?.file) return item

  const ext = item.name?.split('.').pop() || 'bin'
  const path = `${folder}/${Date.now()}-${uid()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(path, item.file, {
      cacheControl: '3600',
      upsert: false,
      contentType: item.file.type || 'application/octet-stream',
    })

  if (uploadError) throw uploadError

  const { data } = supabase.storage.from(bucket).getPublicUrl(path)

  return {
    id: item.id || uid(),
    name: item.name || path,
    type: item.type || item.file.type || '',
    url: data.publicUrl,
  }
}

function AuthScreen() {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [acceptPrivacy, setAcceptPrivacy] = useState(false)

  const handleSubmit = async () => {
    try {
      setLoading(true)

      if (!email || !password) {
        alert('Inserisci email e password.')
        return
      }

      if (mode === 'register') {
        if (!acceptTerms || !acceptPrivacy) {
          alert('Per registrarti devi accettare Termini e Privacy.')
          return
        }
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              accepted_terms: true,
              accepted_privacy: true,
              accepted_at: new Date().toISOString(),
            },
          },
        })

        if (error) throw error

        alert('Registrazione completata. Ora puoi accedere.')
        setMode('login')
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) throw error
      }
    } catch (err) {
      console.error(err)
      alert(err.message || 'Errore di autenticazione.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.authPage}>
      <div style={styles.homeOverlay} />
      <div style={styles.homeVignette} />

      <div style={styles.authCard}>
        <h1 style={styles.authTitle}>Memories</h1>
        <div style={styles.authSubtitle}>
          {mode === 'login' ? 'Accedi al tuo spazio personale' : 'Crea il tuo account'}
        </div>

        <div style={styles.field}>
          <div style={styles.label}>Email</div>
          <input
            type="email"
            style={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div style={styles.field}>
          <div style={styles.label}>Password</div>
          <input
            type="password"
            style={styles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {mode === 'register' && (
          <div style={styles.checkboxWrap}>
            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
              />
              <span>
                Ho letto e accetto i <a href="/termini" style={styles.inlineLink}>Termini e Condizioni</a>
              </span>
            </label>

            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={acceptPrivacy}
                onChange={(e) => setAcceptPrivacy(e.target.checked)}
              />
              <span>
                Ho letto la <a href="/privacy" style={styles.inlineLink}>Privacy Policy</a>
              </span>
            </label>
          </div>
        )}

        <div style={styles.actions}>
          <button style={styles.primaryButton} onClick={handleSubmit} disabled={loading}>
            {loading ? 'Attendere...' : mode === 'login' ? 'Accedi' : 'Registrati'}
          </button>
        </div>

        <div style={{ textAlign: 'center', marginTop: 18 }}>
          <button
            style={styles.linkButton}
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
          >
            {mode === 'login'
              ? 'Non hai un account? Registrati'
              : 'Hai già un account? Accedi'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Home({ go, memoryCount, isOwner, isLimitReached }) {
  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <div style={styles.home}>
      <div style={styles.homeOverlay} />
      <div style={styles.homeVignette} />

      <div style={styles.homeContent}>
        <h1 style={styles.homeTitle}>Memories</h1>

        {!isOwner && (
          <div style={styles.limitBadge}>
            Piano Free · {memoryCount}/{FREE_MEMORY_LIMIT} ricordi
          </div>
        )}

        {!isOwner && isLimitReached && (
          <div style={styles.limitWarningHome}>
            Hai raggiunto il limite dei ricordi gratuiti. Elimina un ricordo oppure sblocca la memoria completa.
          </div>
        )}

        <div style={styles.homeMenu}>
          <button style={styles.homeMenuButton} onClick={() => go('profile')}>
            Chi sono
          </button>

          <button style={styles.homeMenuButton} onClick={() => go('memories')}>
            Ricordi
          </button>

          <button
            style={styles.homeMenuButton}
            onClick={() => {
              if (!isOwner && isLimitReached) {
                alert(
                  'Hai raggiunto il limite dei ricordi gratuiti. Elimina un ricordo esistente oppure sblocca la memoria completa.'
                )
                return
              }
              go('editor')
            }}
          >
            Nuovo ricordo
          </button>

          <button style={styles.homeMenuButton} onClick={handleLogout}>
            Logout
          </button>
        </div>
        <div style={styles.legalLinks}>
          <a href="/legal" style={styles.legalLink}>Legal</a>
          <a href="/termini" style={styles.legalLink}>Termini</a>
          <a href="/privacy" style={styles.legalLink}>Privacy</a>
          <a href="/cookie" style={styles.legalLink}>Cookie</a>
        </div>
      </div>
    </div>
  )
}

function PageShell({ title, go, children }) {
  return (
    <div style={styles.page}>
      <div style={styles.homeOverlay} />
      <div style={styles.pageTint} />
      <div style={styles.homeVignette} />

      <div style={styles.pageInner}>
        <button style={styles.backButton} onClick={() => go('home')}>
          ← Home
        </button>

        <h2 style={styles.pageTitle}>{title}</h2>

        {children}
      </div>
    </div>
  )
}

function ImageLightbox({ src, onClose }) {
  if (!src) return null

  return (
    <div style={styles.lightboxOverlay} onClick={onClose}>
      <div style={styles.lightboxInner} onClick={(e) => e.stopPropagation()}>
        <button style={styles.lightboxClose} onClick={onClose}>
          ✕
        </button>
        <img src={src} alt="" style={styles.lightboxImage} />
      </div>
    </div>
  )
}

function Profile({ profile, session, go, refreshProfile }) {
  const [local, setLocal] = useState({
    id: profile.id || '',
    firstName: profile.firstName || '',
    lastName: profile.lastName || '',
    nickname: profile.nickname || '',
    birthDate: profile.birthDate || '',
    birthPlace: profile.birthPlace || '',
    bio: profile.bio || '',
    images: profile.images || [],
  })

  const [previewSrc, setPreviewSrc] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setLocal({
      id: profile.id || '',
      firstName: profile.firstName || '',
      lastName: profile.lastName || '',
      nickname: profile.nickname || '',
      birthDate: profile.birthDate || '',
      birthPlace: profile.birthPlace || '',
      bio: profile.bio || '',
      images: profile.images || [],
    })
  }, [profile])

  const handleAddImages = (e) => {
    const files = Array.from(e.target.files || [])
    const newImages = files.map((file) => ({
      id: uid(),
      name: file.name,
      type: file.type,
      url: URL.createObjectURL(file),
      file,
    }))

    setLocal((prev) => ({
      ...prev,
      images: [...prev.images, ...newImages],
    }))
    e.target.value = ''
  }

  const removeImage = (id) => {
    setLocal((prev) => ({
      ...prev,
      images: prev.images.filter((img) => img.id !== id),
    }))
  }

  const saveProfile = async () => {
    try {
      setSaving(true)

      const uploadedImages = []
      for (const img of local.images) {
        if (img.file) {
          const uploaded = await uploadFileToBucket(
            'profile-images',
            img,
            `profile-images/${session.user.id}`
          )
          uploadedImages.push(uploaded)
        } else {
          uploadedImages.push(img)
        }
      }

      const row = {
        user_id: session.user.id,
        first_name: local.firstName,
        last_name: local.lastName,
        nickname: local.nickname,
        birth_date: local.birthDate || null,
        birth_place: local.birthPlace,
        bio: local.bio,
        images: JSON.stringify(uploadedImages),
      }

      if (local.id) {
        const { error } = await supabase
          .from('profiles')
          .update(row)
          .eq('id', local.id)
          .eq('user_id', session.user.id)

        if (error) throw error
      } else {
        const { data, error } = await supabase
          .from('profiles')
          .insert([row])
          .select()
          .single()

        if (error) throw error

        row.id = data.id
      }

      await refreshProfile()
      go('home')
    } catch (err) {
      console.error(err)
      alert('Errore nel salvataggio del profilo su Supabase.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <PageShell title="Chi sono" go={go}>
      <div style={styles.panel}>
        <div style={styles.formGrid}>
          <Field
            label="Nome"
            value={local.firstName}
            onChange={(v) => setLocal({ ...local, firstName: v })}
          />
          <Field
            label="Cognome"
            value={local.lastName}
            onChange={(v) => setLocal({ ...local, lastName: v })}
          />
          <Field
            label="Soprannome"
            value={local.nickname}
            onChange={(v) => setLocal({ ...local, nickname: v })}
          />
          <Field
            label="Data di nascita"
            value={local.birthDate}
            type="date"
            onChange={(v) => setLocal({ ...local, birthDate: v })}
          />
          <Field
            label="Luogo di nascita"
            value={local.birthPlace}
            onChange={(v) => setLocal({ ...local, birthPlace: v })}
          />
        </div>

        <div style={{ marginTop: 20 }}>
          <div style={styles.label}>Nota personale</div>
          <textarea
            style={styles.textarea}
            value={local.bio}
            onChange={(e) => setLocal({ ...local, bio: e.target.value })}
          />
        </div>
      </div>

      <div style={styles.panel}>
        <div style={styles.sectionTitle}>Foto del titolare</div>

        <label style={styles.uploadLabel}>
          Carica immagini
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleAddImages}
            style={{ display: 'none' }}
          />
        </label>

        {local.images.length > 0 && (
          <div style={styles.imageGrid}>
            {local.images.map((img) => (
              <div key={img.id} style={styles.imageCard}>
                <button
                  style={styles.imageButton}
                  onClick={() => setPreviewSrc(img.url)}
                >
                  <img src={img.url} alt={img.name} style={styles.imagePreview} />
                </button>
                <button
                  style={styles.smallGhostButton}
                  onClick={() => removeImage(img.id)}
                >
                  Rimuovi
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={styles.actions}>
        <button
          style={styles.primaryButton}
          onClick={saveProfile}
          disabled={saving}
        >
          {saving ? 'Salvataggio...' : 'Salva'}
        </button>
      </div>

      <ImageLightbox src={previewSrc} onClose={() => setPreviewSrc(null)} />
    </PageShell>
  )
}

function Memories({
  memories,
  go,
  setEditing,
  setViewing,
  deleteMemory,
  isOwner,
  isLimitReached,
}) {
  const [search, setSearch] = useState('')

  const filteredMemories = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return memories

    return memories.filter((memory) => {
      const title = (memory.title || '').toLowerCase()
      const text = (memory.text || '').toLowerCase()
      return title.includes(q) || text.includes(q)
    })
  }, [memories, search])

  return (
    <PageShell title="Ricordi" go={go}>
      <div style={styles.actionsTop}>
        <button
          style={styles.primaryButton}
          onClick={() => {
            if (!isOwner && isLimitReached) {
              alert(
                'Hai raggiunto il limite dei ricordi gratuiti. Elimina un ricordo esistente oppure sblocca la memoria completa.'
              )
              return
            }
            setEditing(null)
            go('editor')
          }}
        >
          Nuovo ricordo
        </button>
      </div>

      {!isOwner && (
        <div style={styles.freeInfoPanel}>
          Piano Free · {memories.length}/{FREE_MEMORY_LIMIT} ricordi
          {isLimitReached ? ' · limite raggiunto' : ''}
        </div>
      )}

      <div style={styles.searchWrap}>
        <input
          style={styles.searchInput}
          type="text"
          placeholder="Cerca nei ricordi"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {memories.length === 0 ? (
        <div style={styles.emptyPanel}>Nessun ricordo salvato.</div>
      ) : filteredMemories.length === 0 ? (
        <div style={styles.emptyPanel}>Nessun ricordo trovato.</div>
      ) : (
        <div style={styles.memoryGrid}>
          {filteredMemories.map((memory) => (
            <div key={memory.id} style={styles.memoryCard}>
              <div style={styles.memoryCardTitle}>{memory.title || 'Senza titolo'}</div>

              <div style={styles.memoryCardText}>
                {memory.text ? memory.text.slice(0, 120) : ''}
              </div>

              <div style={styles.memoryMeta}>
                {memory.audio?.voiceUrl ? <span>🎙️</span> : null}
                {memory.images?.length ? <span> 📷 {memory.images.length}</span> : null}
                {memory.videos?.length ? <span> 🎥 {memory.videos.length}</span> : null}
                {memory.audio?.tracks?.length ? <span> 🎵 {memory.audio.tracks.length}</span> : null}
              </div>

              <div style={styles.memoryCardActions}>
                <button
                  style={styles.smallButton}
                  onClick={() => {
                    setViewing(memory)
                    go('detail')
                  }}
                >
                  Apri
                </button>

                <button
                  style={styles.smallButton}
                  onClick={() => {
                    setEditing(memory)
                    go('editor')
                  }}
                >
                  Modifica
                </button>

                <button
                  style={styles.smallDeleteButton}
                  onClick={() => deleteMemory(memory.id)}
                >
                  Elimina
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageShell>
  )
}

function MemoryDetail({ memory, go, setEditing, deleteMemory }) {
  const [previewSrc, setPreviewSrc] = useState(null)

  if (!memory) {
    return (
      <PageShell title="Ricordo" go={go}>
        <div style={styles.emptyPanel}>Nessun ricordo selezionato.</div>
      </PageShell>
    )
  }

  return (
    <PageShell title={memory.title || 'Ricordo'} go={go}>
      <div style={styles.panel}>
        <div style={styles.detailTextBlock}>
          {memory.text || 'Nessun testo inserito.'}
        </div>
      </div>

      {memory.audio?.voiceUrl && (
        <div style={styles.voicePanel}>
          <div style={styles.voiceTitle}>Voce</div>
          <audio controls src={memory.audio.voiceUrl} style={{ width: '100%' }} />
        </div>
      )}

      {memory.images?.length > 0 && (
        <div style={styles.panel}>
          <div style={styles.sectionTitle}>Foto</div>
          <div style={styles.imageGrid}>
            {memory.images.map((img) => (
              <button
                key={img.id}
                style={styles.imageButton}
                onClick={() => setPreviewSrc(img.url)}
              >
                <img src={img.url} alt={img.name} style={styles.imagePreview} />
              </button>
            ))}
          </div>
        </div>
      )}

      {memory.videos?.length > 0 && (
        <div style={styles.panel}>
          <div style={styles.sectionTitle}>Video</div>
          <div style={styles.mediaGrid}>
            {memory.videos.map((video) => (
              <div key={video.id} style={styles.mediaCard}>
                <video src={video.url} controls style={styles.videoPreview} />
              </div>
            ))}
          </div>
        </div>
      )}

      {memory.audio?.tracks?.length > 0 && (
        <div style={styles.panel}>
          <div style={styles.sectionTitle}>Tracce audio / musicali</div>
          <div style={styles.trackList}>
            {memory.audio.tracks.map((track) => (
              <div key={track.id} style={styles.trackItem}>
                <div style={styles.trackName}>{track.name}</div>
                <audio controls src={track.url} style={{ width: '100%' }} />
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={styles.actionsDetail}>
        <button
          style={styles.primaryButton}
          onClick={() => {
            setEditing(memory)
            go('editor')
          }}
        >
          Modifica
        </button>

        <button
          style={styles.deleteButtonLarge}
          onClick={() => deleteMemory(memory.id, true)}
        >
          Elimina
        </button>
      </div>

      <ImageLightbox src={previewSrc} onClose={() => setPreviewSrc(null)} />
    </PageShell>
  )
}

function Editor({
  session,
  editing,
  setEditing,
  go,
  refreshMemories,
  memoryCount,
  isOwner,
}) {
  const [data, setData] = useState(
    editing || {
      id: '',
      title: '',
      text: '',
      audio: {
        voiceUrl: null,
        voiceFile: null,
        tracks: [],
      },
      images: [],
      videos: [],
    }
  )

  const [previewSrc, setPreviewSrc] = useState(null)
  const [saving, setSaving] = useState(false)

  const recorderRef = useRef(null)
  const chunksRef = useRef([])
  const [recording, setRecording] = useState(false)

  const isNewMemory = !editing?.id
  const isLimitReached = !isOwner && isNewMemory && memoryCount >= FREE_MEMORY_LIMIT

  useEffect(() => {
    setData(
      editing || {
        id: '',
        title: '',
        text: '',
        audio: {
          voiceUrl: null,
          voiceFile: null,
          tracks: [],
        },
        images: [],
        videos: [],
      }
    )
  }, [editing])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      chunksRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const file = new File([blob], `voice-${Date.now()}.webm`, { type: 'audio/webm' })
        const url = URL.createObjectURL(blob)

        setData((prev) => ({
          ...prev,
          audio: {
            ...(prev.audio || {}),
            voiceUrl: url,
            voiceFile: file,
          },
        }))
      }

      recorderRef.current = recorder
      recorder.start()
      setRecording(true)
    } catch {
      alert('Impossibile accedere al microfono.')
    }
  }

  const stopRecording = () => {
    if (recorderRef.current) {
      recorderRef.current.stop()
      setRecording(false)
    }
  }

  const handleFiles = (field, files) => {
    const list = Array.from(files || []).map((file) => ({
      id: uid(),
      name: file.name,
      type: file.type,
      url: URL.createObjectURL(file),
      file,
    }))

    setData((prev) => ({
      ...prev,
      [field]: [...(prev[field] || []), ...list],
    }))
  }

  const handleTrackFiles = (files) => {
    const list = Array.from(files || []).map((file) => ({
      id: uid(),
      name: file.name,
      type: file.type,
      url: URL.createObjectURL(file),
      file,
    }))

    setData((prev) => ({
      ...prev,
      audio: {
        ...(prev.audio || {}),
        tracks: [...(prev.audio?.tracks || []), ...list],
      },
    }))
  }

  const removeFile = (field, id) => {
    setData((prev) => ({
      ...prev,
      [field]: prev[field].filter((item) => item.id !== id),
    }))
  }

  const removeTrack = (id) => {
    setData((prev) => ({
      ...prev,
      audio: {
        ...(prev.audio || {}),
        tracks: (prev.audio?.tracks || []).filter((item) => item.id !== id),
      },
    }))
  }

  const saveMemory = async () => {
    try {
      if (isLimitReached) {
        alert(
          'Hai raggiunto il limite dei ricordi gratuiti. Elimina un ricordo esistente oppure sblocca la memoria completa.'
        )
        return
      }

      setSaving(true)

      let voiceUrl = data.audio?.voiceUrl || null
      if (data.audio?.voiceFile) {
        const uploadedVoice = await uploadFileToBucket(
          'memory-audio',
          {
            id: uid(),
            name: data.audio.voiceFile.name,
            type: data.audio.voiceFile.type,
            file: data.audio.voiceFile,
          },
          `voice/${session.user.id}`
        )
        voiceUrl = uploadedVoice.url
      }

      const uploadedImages = []
      for (const img of data.images || []) {
        if (img.file) {
          const uploaded = await uploadFileToBucket(
            'memory-images',
            img,
            `images/${session.user.id}`
          )
          uploadedImages.push(uploaded)
        } else {
          uploadedImages.push(img)
        }
      }

      const uploadedVideos = []
      for (const video of data.videos || []) {
        if (video.file) {
          const uploaded = await uploadFileToBucket(
            'memory-videos',
            video,
            `videos/${session.user.id}`
          )
          uploadedVideos.push(uploaded)
        } else {
          uploadedVideos.push(video)
        }
      }

      const uploadedTracks = []
      for (const track of data.audio?.tracks || []) {
        if (track.file) {
          const uploaded = await uploadFileToBucket(
            'memory-audio',
            track,
            `tracks/${session.user.id}`
          )
          uploadedTracks.push(uploaded)
        } else {
          uploadedTracks.push(track)
        }
      }

      const row = {
        user_id: session.user.id,
        titolo: data.title,
        testo: data.text,
        foto: JSON.stringify(uploadedImages),
        video: JSON.stringify(uploadedVideos),
        audio: JSON.stringify({
          voiceUrl,
          tracks: uploadedTracks,
        }),
      }

      if (editing?.id) {
        const { error } = await supabase
          .from('ricordi')
          .update(row)
          .eq('id', editing.id)
          .eq('user_id', session.user.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('ricordi')
          .insert([row])

        if (error) throw error
      }

      await refreshMemories()
      setEditing(null)
      go('memories')
    } catch (err) {
      console.error(err)
      alert('Errore nel salvataggio del ricordo su Supabase.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <PageShell title={editing ? 'Modifica ricordo' : 'Nuovo ricordo'} go={go}>
      {isLimitReached && (
        <div style={styles.limitPanel}>
          Hai raggiunto il limite dei ricordi gratuiti. Elimina un ricordo esistente per crearne uno nuovo, oppure sblocca la memoria completa.
        </div>
      )}

      <div style={styles.panel}>
        <Field
          label="Titolo"
          value={data.title}
          onChange={(v) => setData({ ...data, title: v })}
        />

        <div style={{ marginTop: 20 }}>
          <div style={styles.label}>Testo</div>
          <textarea
            style={styles.textareaLarge}
            value={data.text}
            onChange={(e) => setData({ ...data, text: e.target.value })}
          />
        </div>
      </div>

      <div style={styles.voicePanel}>
        <div style={styles.voiceTitle}>Voce</div>

        <div style={styles.voiceActions}>
          {!recording ? (
            <button style={styles.primaryButton} onClick={startRecording}>
              Registra
            </button>
          ) : (
            <button style={styles.stopButton} onClick={stopRecording}>
              Stop
            </button>
          )}
        </div>

        {data.audio?.voiceUrl && (
          <div style={{ marginTop: 18 }}>
            <audio controls src={data.audio.voiceUrl} style={{ width: '100%' }} />
          </div>
        )}
      </div>

      <div style={styles.panel}>
        <div style={styles.sectionTitle}>Foto</div>
        <label style={styles.uploadLabel}>
          Carica foto
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => handleFiles('images', e.target.files)}
            style={{ display: 'none' }}
          />
        </label>

        {data.images?.length > 0 && (
          <div style={styles.imageGrid}>
            {data.images.map((img) => (
              <div key={img.id} style={styles.imageCard}>
                <button
                  style={styles.imageButton}
                  onClick={() => setPreviewSrc(img.url)}
                >
                  <img src={img.url} alt={img.name} style={styles.imagePreview} />
                </button>
                <button
                  style={styles.smallGhostButton}
                  onClick={() => removeFile('images', img.id)}
                >
                  Rimuovi
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={styles.panel}>
        <div style={styles.sectionTitle}>Video</div>
        <label style={styles.uploadLabel}>
          Carica video
          <input
            type="file"
            multiple
            accept="video/*"
            onChange={(e) => handleFiles('videos', e.target.files)}
            style={{ display: 'none' }}
          />
        </label>

        {data.videos?.length > 0 && (
          <div style={styles.mediaGrid}>
            {data.videos.map((video) => (
              <div key={video.id} style={styles.mediaCard}>
                <video src={video.url} controls style={styles.videoPreview} />
                <button
                  style={styles.smallGhostButton}
                  onClick={() => removeFile('videos', video.id)}
                >
                  Rimuovi
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={styles.panel}>
        <div style={styles.sectionTitle}>Tracce audio / musicali</div>
        <label style={styles.uploadLabel}>
          Carica tracce
          <input
            type="file"
            multiple
            accept="audio/*"
            onChange={(e) => handleTrackFiles(e.target.files)}
            style={{ display: 'none' }}
          />
        </label>

        {data.audio?.tracks?.length > 0 && (
          <div style={styles.trackList}>
            {data.audio.tracks.map((track) => (
              <div key={track.id} style={styles.trackItem}>
                <div style={styles.trackName}>{track.name}</div>
                <audio controls src={track.url} style={{ width: '100%' }} />
                <button
                  style={styles.smallGhostButton}
                  onClick={() => removeTrack(track.id)}
                >
                  Rimuovi
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={styles.actions}>
        <button
          style={{
            ...styles.primaryButton,
            ...(isLimitReached ? styles.disabledButton : {}),
          }}
          onClick={saveMemory}
          disabled={saving || isLimitReached}
        >
          {saving ? 'Salvataggio...' : 'Salva'}
        </button>
      </div>

      <ImageLightbox src={previewSrc} onClose={() => setPreviewSrc(null)} />
    </PageShell>
  )
}

function Field({ label, value, onChange, type = 'text' }) {
  return (
    <div style={styles.field}>
      <div style={styles.label}>{label}</div>
      <input
        type={type}
        style={styles.input}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}

export default function App() {
  const path = window.location.pathname

  if (path === '/legal') return <LegalPage />
  if (path === '/termini') return <TermsPage />
  if (path === '/privacy') return <PrivacyPage />
  if (path === '/cookie') return <CookiePage />
  const [cookieNoticeSeen, setCookieNoticeSeen] = useState(
    localStorage.getItem('uw_cookie_notice_seen') === 'true'
  )
  const dismissCookieNotice = () => {
    localStorage.setItem('uw_cookie_notice_seen', 'true')
    setCookieNoticeSeen(true)
  }
  function CookieBanner({ onClose }) {
    return (
      <div style={styles.cookieBanner}>
        <div style={styles.cookieBannerText}>
          Questo sito utilizza cookie tecnici necessari al funzionamento della piattaforma.
          Per saperne di più, consulta la{' '}
          <a href="/cookie" style={styles.cookieBannerLink}>
            Cookie Policy
          </a>.
        </div>
  
        <button style={styles.cookieBannerButton} onClick={onClose}>
          Ho capito
        </button>
      </div>
    )
  }
  const [page, setPage] = useState('home')
  const [profile, setProfile] = useState({})
  const [memories, setMemories] = useState([])
  const [editing, setEditing] = useState(null)
  const [viewing, setViewing] = useState(null)
  const [loadingMemories, setLoadingMemories] = useState(true)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [session, setSession] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  const isOwner = ADMIN_EMAILS.includes(
  (session?.user?.email || '').toLowerCase()
)
  const isLimitReached = !isOwner && memories.length >= FREE_MEMORY_LIMIT

  useEffect(() => {
    const fontId = 'uw-great-vibes-font'
    if (!document.getElementById(fontId)) {
      const link = document.createElement('link')
      link.id = fontId
      link.rel = 'stylesheet'
      link.href =
        'https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap'
      document.head.appendChild(link)
    }
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null)
      setAuthLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session ?? null)
      setAuthLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const refreshProfile = async () => {
    try {
      if (!session?.user?.id) {
        setProfile({})
        return
      }

      setLoadingProfile(true)

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .maybeSingle()

      if (error) throw error

      if (!data) {
        setProfile({})
        return
      }

      setProfile({
        id: data.id,
        firstName: data.first_name || '',
        lastName: data.last_name || '',
        nickname: data.nickname || '',
        birthDate: data.birth_date || '',
        birthPlace: data.birth_place || '',
        bio: data.bio || '',
        images: safeJsonParse(data.images, []),
      })
    } catch (err) {
      console.error(err)
      alert('Errore nel caricamento del profilo da Supabase.')
    } finally {
      setLoadingProfile(false)
    }
  }

  const refreshMemories = async () => {
    try {
      if (!session?.user?.id) {
        setMemories([])
        return
      }

      setLoadingMemories(true)

      const { data, error } = await supabase
        .from('ricordi')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      const normalized = (data || []).map((row) => ({
        id: row.id,
        title: row.titolo || '',
        text: row.testo || '',
        images: safeJsonParse(row.foto, []),
        videos: safeJsonParse(row.video, []),
        audio: safeJsonParse(row.audio, { voiceUrl: null, tracks: [] }),
        created_at: row.created_at,
      }))

      setMemories(normalized)
    } catch (err) {
      console.error(err)
      alert('Errore nel caricamento dei ricordi da Supabase.')
    } finally {
      setLoadingMemories(false)
    }
  }

  const deleteMemory = async (memoryId, goBackToList = false) => {
    const confirmed = window.confirm(
      'Vuoi davvero eliminare questo ricordo? Questa azione è definitiva.'
    )

    if (!confirmed) return

    try {
      const { error } = await supabase
        .from('ricordi')
        .delete()
        .eq('id', memoryId)
        .eq('user_id', session.user.id)

      if (error) throw error

      if (editing?.id === memoryId) {
        setEditing(null)
      }

      if (viewing?.id === memoryId) {
        setViewing(null)
      }

      await refreshMemories()

      if (goBackToList) {
        go('memories')
      }
    } catch (err) {
      console.error(err)
      alert('Errore nell’eliminazione del ricordo.')
    }
  }

  useEffect(() => {
    if (session) {
      refreshProfile()
      refreshMemories()
    } else {
      setProfile({})
      setMemories([])
      setLoadingProfile(false)
      setLoadingMemories(false)
    }
  }, [session])

  const go = (target) => setPage(target)

  if (authLoading) {
    return (
      <div style={styles.authPage}>
        <div style={styles.homeOverlay} />
        <div style={styles.homeVignette} />
        <div style={styles.authCard}>Caricamento...</div>
      </div>
    )
  }

  if (!session) {
    return <AuthScreen />
  }

  if (page === 'home') {
    return (
      <>
        <Home
          go={go}
          memoryCount={memories.length}
          isOwner={isOwner}
          isLimitReached={isLimitReached}
        />
        {!cookieNoticeSeen && <CookieBanner onClose={dismissCookieNotice} />}
      </>
    )
  }

  if (page === 'profile') {
    return loadingProfile ? (
      <PageShell title="Chi sono" go={go}>
        <div style={styles.emptyPanel}>Caricamento profilo...</div>
      </PageShell>
    ) : (
      <Profile
        profile={profile}
        session={session}
        go={go}
        refreshProfile={refreshProfile}
      />
    )
  }

  if (page === 'memories') {
    return loadingMemories ? (
      <PageShell title="Ricordi" go={go}>
        <div style={styles.emptyPanel}>Caricamento...</div>
      </PageShell>
    ) : (
      <Memories
        memories={memories}
        go={go}
        setEditing={setEditing}
        setViewing={setViewing}
        deleteMemory={deleteMemory}
        isOwner={isOwner}
        isLimitReached={isLimitReached}
      />
    )
  }

  if (page === 'editor') {
    return (
      <Editor
        session={session}
        editing={editing}
        setEditing={setEditing}
        go={go}
        refreshMemories={refreshMemories}
        memoryCount={memories.length}
        isOwner={isOwner}
      />
    )
  }

  if (page === 'detail') {
    return (
      <MemoryDetail
        memory={viewing}
        go={go}
        setEditing={setEditing}
        deleteMemory={deleteMemory}
      />
    )
  }

  return null
}

const styles = {
  authPage: {
    minHeight: '100vh',
    position: 'relative',
    overflow: 'hidden',
    backgroundImage: `url('/home-bg.jpg')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  },

  authCard: {
    position: 'relative',
    zIndex: 2,
    width: 'min(460px, calc(100% - 40px))',
    background: 'rgba(22, 14, 12, 0.58)',
    border: '1px solid rgba(255,255,255,0.10)',
    borderRadius: '28px',
    padding: '32px',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 18px 50px rgba(0,0,0,0.25)',
    color: '#f5efe4',
  },

  authTitle: {
    margin: '0 0 10px 0',
    textAlign: 'center',
    fontFamily: '"Great Vibes", cursive',
    fontSize: '4rem',
    lineHeight: 1,
    color: '#e7c27f',
    fontWeight: 400,
  },

  authSubtitle: {
    textAlign: 'center',
    marginBottom: '22px',
    color: '#f0e5d4',
  },

  linkButton: {
    border: 'none',
    background: 'transparent',
    color: '#f3d6a2',
    cursor: 'pointer',
    fontSize: '0.95rem',
  },

  home: {
    minHeight: '100vh',
    position: 'relative',
    overflow: 'hidden',
    backgroundImage: `url('/home-bg.jpg')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  },

  homeOverlay: {
    position: 'absolute',
    inset: 0,
    background:
      'linear-gradient(rgba(18,10,8,0.34), rgba(18,10,8,0.50))',
  },

  homeVignette: {
    position: 'absolute',
    inset: 0,
    background:
      'radial-gradient(circle at center, transparent 40%, rgba(10,6,5,0.34) 100%)',
  },

  homeContent: {
    position: 'relative',
    zIndex: 2,
    textAlign: 'center',
    width: 'min(960px, calc(100% - 40px))',
    padding: '40px 20px',
  },

  homeTitle: {
    margin: '0 0 34px 0',
    fontFamily: '"Great Vibes", cursive',
    fontSize: 'clamp(5.2rem, 11vw, 9rem)',
    lineHeight: 1,
    color: '#e7c27f',
    textShadow: '0 0 24px rgba(231,194,127,0.16)',
    fontWeight: 400,
  },

  limitBadge: {
    display: 'inline-block',
    marginBottom: '18px',
    padding: '10px 18px',
    borderRadius: '999px',
    background: 'rgba(255,255,255,0.10)',
    border: '1px solid rgba(243,220,177,0.20)',
    color: '#f7ead1',
    backdropFilter: 'blur(8px)',
  },

  limitWarningHome: {
    width: 'min(760px, 100%)',
    margin: '0 auto 24px auto',
    padding: '14px 18px',
    borderRadius: '18px',
    background: 'rgba(120,60,24,0.36)',
    border: '1px solid rgba(243,220,177,0.22)',
    color: '#f7ead1',
    lineHeight: 1.5,
  },

  homeMenu: {
    display: 'flex',
    justifyContent: 'center',
    gap: '18px',
    flexWrap: 'wrap',
  },

  homeMenuButton: {
    minWidth: '180px',
    padding: '16px 24px',
    borderRadius: '999px',
    border: '1px solid rgba(243,220,177,0.24)',
    background: 'rgba(56,31,18,0.28)',
    color: '#f7ead1',
    fontSize: '1.02rem',
    letterSpacing: '0.02em',
    cursor: 'pointer',
    backdropFilter: 'blur(8px)',
    boxShadow: '0 10px 30px rgba(0,0,0,0.14)',
  },

  page: {
    minHeight: '100vh',
    position: 'relative',
    overflow: 'hidden',
    backgroundImage: `url('/home-bg.jpg')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    color: '#f5efe4',
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  },

  pageTint: {
    position: 'absolute',
    inset: 0,
    background:
      'linear-gradient(rgba(12,12,20,0.72), rgba(12,12,20,0.82))',
  },

  pageInner: {
    position: 'relative',
    zIndex: 2,
    width: 'min(980px, calc(100% - 40px))',
    margin: '0 auto',
    padding: '34px 0 60px',
  },

  backButton: {
    border: '1px solid rgba(255,255,255,0.16)',
    background: 'rgba(255,255,255,0.08)',
    color: '#f1e7d6',
    borderRadius: '999px',
    padding: '10px 16px',
    cursor: 'pointer',
    marginBottom: '24px',
  },

  pageTitle: {
    margin: '10px 0 28px 0',
    textAlign: 'center',
    fontSize: 'clamp(2.2rem, 5vw, 3.2rem)',
    fontWeight: 500,
    color: '#f5efe4',
  },

  freeInfoPanel: {
    textAlign: 'center',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '24px',
    padding: '16px 24px',
    color: '#f0e5d4',
    marginBottom: '18px',
  },

  limitPanel: {
    textAlign: 'center',
    background: 'rgba(120,60,24,0.36)',
    border: '1px solid rgba(243,220,177,0.22)',
    borderRadius: '24px',
    padding: '18px 22px',
    color: '#f7ead1',
    marginBottom: '22px',
    lineHeight: 1.5,
  },

  searchWrap: {
    marginBottom: '22px',
    display: 'flex',
    justifyContent: 'center',
  },

  searchInput: {
    width: 'min(620px, 100%)',
    boxSizing: 'border-box',
    padding: '14px 18px',
    borderRadius: '999px',
    border: '1px solid rgba(255,255,255,0.14)',
    background: 'rgba(255,255,255,0.10)',
    color: '#f5efe4',
    fontSize: '1rem',
    outline: 'none',
    backdropFilter: 'blur(8px)',
  },

  panel: {
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.10)',
    borderRadius: '28px',
    padding: '28px',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 18px 50px rgba(0,0,0,0.18)',
    marginBottom: '22px',
  },

  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '18px',
  },

  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },

  label: {
    color: '#e9dbc2',
    fontSize: '0.95rem',
    letterSpacing: '0.02em',
  },

  input: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '14px 16px',
    borderRadius: '16px',
    border: '1px solid rgba(255,255,255,0.10)',
    background: 'rgba(255,255,255,0.92)',
    color: '#2b2017',
    fontSize: '1rem',
    outline: 'none',
  },

  textarea: {
    width: '100%',
    minHeight: '150px',
    boxSizing: 'border-box',
    padding: '16px',
    borderRadius: '18px',
    border: '1px solid rgba(255,255,255,0.10)',
    background: 'rgba(255,255,255,0.92)',
    color: '#2b2017',
    fontSize: '1rem',
    outline: 'none',
    resize: 'vertical',
  },

  textareaLarge: {
    width: '100%',
    minHeight: '220px',
    boxSizing: 'border-box',
    padding: '16px',
    borderRadius: '18px',
    border: '1px solid rgba(255,255,255,0.10)',
    background: 'rgba(255,255,255,0.92)',
    color: '#2b2017',
    fontSize: '1rem',
    outline: 'none',
    resize: 'vertical',
  },

  detailTextBlock: {
    color: '#f3e6cf',
    lineHeight: 1.8,
    whiteSpace: 'pre-wrap',
    fontSize: '1.02rem',
  },

  sectionTitle: {
    color: '#f3e6cf',
    fontSize: '1.3rem',
    marginBottom: '18px',
  },

  uploadLabel: {
    display: 'inline-block',
    padding: '12px 18px',
    borderRadius: '999px',
    background: 'rgba(103,63,31,0.42)',
    border: '1px solid rgba(243,220,177,0.20)',
    color: '#f6e8cf',
    cursor: 'pointer',
    marginBottom: '18px',
  },

  imageGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '16px',
    marginTop: '8px',
  },

  imageCard: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '18px',
    padding: '10px',
  },

  imageButton: {
    display: 'block',
    width: '100%',
    padding: 0,
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    marginBottom: '10px',
  },

  imagePreview: {
    width: '100%',
    height: 'auto',
    maxHeight: '400px',
    objectFit: 'contain',
    borderRadius: '12px',
    display: 'block',
    background: 'rgba(0,0,0,0.35)',
  },

  mediaGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '16px',
    marginTop: '8px',
  },

  mediaCard: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '18px',
    padding: '12px',
  },

  videoPreview: {
    width: '100%',
    borderRadius: '12px',
    marginBottom: '10px',
    display: 'block',
  },

  trackList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    marginTop: '8px',
  },

  trackItem: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '18px',
    padding: '14px',
  },

  trackName: {
    color: '#f3e6cf',
    marginBottom: '10px',
  },

  smallGhostButton: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.14)',
    background: 'rgba(255,255,255,0.06)',
    color: '#f1e7d6',
    cursor: 'pointer',
  },

  actions: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '28px',
  },

  actionsDetail: {
    display: 'flex',
    justifyContent: 'center',
    gap: '12px',
    flexWrap: 'wrap',
    marginTop: '28px',
  },

  actionsTop: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '22px',
  },

  primaryButton: {
    padding: '14px 24px',
    borderRadius: '999px',
    border: '1px solid rgba(255,219,168,0.22)',
    background: 'linear-gradient(135deg, #8a5727 0%, #c68a3f 100%)',
    color: '#fff7ea',
    fontSize: '1rem',
    cursor: 'pointer',
    boxShadow: '0 12px 28px rgba(0,0,0,0.22)',
  },

  disabledButton: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },

  stopButton: {
    padding: '14px 24px',
    borderRadius: '999px',
    border: '1px solid rgba(255,160,160,0.24)',
    background: 'linear-gradient(135deg, #7c2f2f 0%, #b14949 100%)',
    color: '#fff3f3',
    fontSize: '1rem',
    cursor: 'pointer',
    boxShadow: '0 12px 28px rgba(0,0,0,0.22)',
  },

  deleteButtonLarge: {
    padding: '14px 24px',
    borderRadius: '999px',
    border: '1px solid rgba(255,160,160,0.24)',
    background: 'linear-gradient(135deg, #7c2f2f 0%, #b14949 100%)',
    color: '#fff3f3',
    fontSize: '1rem',
    cursor: 'pointer',
    boxShadow: '0 12px 28px rgba(0,0,0,0.22)',
  },

  emptyPanel: {
    textAlign: 'center',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '24px',
    padding: '40px 24px',
    color: '#f0e5d4',
  },

  memoryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '18px',
  },

  memoryCard: {
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.10)',
    borderRadius: '24px',
    padding: '22px',
    backdropFilter: 'blur(8px)',
    boxShadow: '0 14px 36px rgba(0,0,0,0.14)',
  },

  memoryCardTitle: {
    color: '#f4ead8',
    fontSize: '1.2rem',
    marginBottom: '10px',
  },

  memoryCardText: {
    color: '#dbcdb6',
    lineHeight: 1.6,
    minHeight: '52px',
    marginBottom: '14px',
  },

  memoryMeta: {
    color: '#d8b780',
    fontSize: '0.95rem',
    marginBottom: '16px',
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
  },

  memoryCardActions: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
  },

  smallButton: {
    padding: '10px 14px',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.12)',
    background: 'rgba(255,255,255,0.08)',
    color: '#f1e7d6',
    cursor: 'pointer',
  },

  smallDeleteButton: {
    padding: '10px 14px',
    borderRadius: '12px',
    border: '1px solid rgba(255,160,160,0.20)',
    background: 'rgba(124,47,47,0.36)',
    color: '#fff1f1',
    cursor: 'pointer',
  },

  voicePanel: {
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.10)',
    borderRadius: '30px',
    padding: '30px',
    marginTop: '22px',
    textAlign: 'center',
    boxShadow: '0 18px 50px rgba(0,0,0,0.18)',
  },

  voiceTitle: {
    fontSize: '1.8rem',
    color: '#f2e6d0',
    marginBottom: '18px',
  },

  voiceActions: {
    display: 'flex',
    justifyContent: 'center',
    gap: '14px',
  },

  lightboxOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.78)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '20px',
  },

  lightboxInner: {
    position: 'relative',
    maxWidth: '95vw',
    maxHeight: '95vh',
  },

  lightboxClose: {
    position: 'absolute',
    top: '-10px',
    right: '-10px',
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    border: 'none',
    background: '#fff',
    color: '#222',
    cursor: 'pointer',
    fontSize: '1rem',
    zIndex: 2,
  },

  lightboxImage: {
    maxWidth: '90vw',
    maxHeight: '90vh',
    display: 'block',
    borderRadius: '14px',
    boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
  },
  legalLinks: {
    marginTop: '28px',
    display: 'flex',
    justifyContent: 'center',
    gap: '18px',
    flexWrap: 'wrap',
  },
  
  legalLink: {
    color: '#f3d6a2',
    textDecoration: 'none',
    fontSize: '0.95rem',
  },
  checkboxWrap: {
    marginTop: '18px',
    marginBottom: '18px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },

  checkboxLabel: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    color: '#f0e5d4',
    fontSize: '0.95rem',
    lineHeight: 1.5,
  },

  inlineLink: {
    color: '#f3d6a2',
    textDecoration: 'underline',
  },
  cookieBanner: {
    position: 'fixed',
    left: '20px',
    right: '20px',
    bottom: '20px',
    zIndex: 9999,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
    padding: '16px 18px',
    borderRadius: '18px',
    background: 'rgba(24, 14, 10, 0.88)',
    border: '1px solid rgba(255,255,255,0.12)',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 16px 40px rgba(0,0,0,0.28)',
    color: '#f5efe4',
  },

  cookieBannerText: {
    fontSize: '0.95rem',
    lineHeight: 1.5,
  },

  cookieBannerLink: {
    color: '#f3d6a2',
    textDecoration: 'underline',
  },

  cookieBannerButton: {
    flexShrink: 0,
    padding: '10px 16px',
    borderRadius: '999px',
    border: '1px solid rgba(255,219,168,0.22)',
    background: 'linear-gradient(135deg, #8a5727 0%, #c68a3f 100%)',
    color: '#fff7ea',
    fontSize: '0.95rem',
    cursor: 'pointer',
  },
}
