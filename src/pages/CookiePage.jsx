export default function CookiePage() {
    return (
        <div className="max-w-4xl mx-auto px-6 py-10 text-gray-800">
          <a href="/" style={{ color: '#c68a3f', textDecoration: 'none', display: 'inline-block', marginBottom: '24px' }}>
            ← Home
          </a>
    
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Legal & Privacy</h1>
        <p className="text-sm text-gray-500 mb-8">Ultimo aggiornamento: 19/03/2026</p>
  
        <div className="space-y-6 leading-7">
          <section>
            <h2 className="text-xl font-semibold mb-2">1. Cosa sono i cookie</h2>
            <p>
              I cookie sono piccoli file di testo salvati sul dispositivo dell’utente per
              consentire il corretto funzionamento del sito e dei servizi collegati.
            </p>
          </section>
  
          <section>
            <h2 className="text-xl font-semibold mb-2">2. Tipologie di cookie utilizzati</h2>
            <p>
              Il sito utilizza esclusivamente cookie tecnici necessari al funzionamento
              della piattaforma, come autenticazione, sessione e sicurezza.
            </p>
          </section>
  
          <section>
            <h2 className="text-xl font-semibold mb-2">3. Cookie di terze parti</h2>
            <p>
              Alcuni fornitori tecnici collegati al funzionamento del servizio possono
              utilizzare strumenti tecnici strettamente necessari.
            </p>
          </section>
  
          <section>
            <h2 className="text-xl font-semibold mb-2">4. Finalità</h2>
            <p>
              I cookie utilizzati servono esclusivamente a consentire l’accesso all’area
              riservata, mantenere attiva la sessione e garantire la sicurezza del servizio.
            </p>
          </section>
  
          <section>
            <h2 className="text-xl font-semibold mb-2">5. Consenso</h2>
            <p>
              Per i cookie tecnici non è richiesto uno specifico consenso preventivo.
            </p>
          </section>
  
          <section>
            <h2 className="text-xl font-semibold mb-2">6. Gestione cookie</h2>
            <p>
              L’utente può gestire o disabilitare i cookie tramite le impostazioni del browser,
              sapendo che questo potrebbe compromettere il corretto funzionamento del servizio.
            </p>
          </section>
        </div>
      </div>
    )
  }