export default function LegalPage() {
    return (
      <div className="max-w-4xl mx-auto px-6 py-10 text-gray-800">
        <a href="/" style={{ color: '#c68a3f', textDecoration: 'none', display: 'inline-block', marginBottom: '24px' }}>
          ← Home
        </a>
  
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Legal & Privacy</h1>
        <p className="text-lg mb-8 text-gray-600">
          Trasparenza, protezione dei dati e utilizzo consapevole di UnspokenWords Legacy.
        </p>
  
        <section className="mb-10">
          <p className="leading-7">
            UnspokenWords Legacy è una piattaforma personale per conservare contenuti,
            ricordi e materiali digitali in uno spazio riservato. Alcune funzionalità
            possono elaborare i contenuti caricati per creare esperienze o interazioni
            simulate. Queste funzionalità non rappresentano la persona reale, ma una
            ricostruzione basata sui materiali forniti dall’utente.
          </p>
        </section>
  
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Documenti legali</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <a href="/termini" className="block border rounded-2xl p-5 hover:shadow-md transition">
              <h3 className="font-semibold text-lg mb-2">Termini e Condizioni</h3>
              <p className="text-sm text-gray-600">Regole di utilizzo del servizio.</p>
            </a>
  
            <a href="/privacy" className="block border rounded-2xl p-5 hover:shadow-md transition">
              <h3 className="font-semibold text-lg mb-2">Privacy Policy</h3>
              <p className="text-sm text-gray-600">Come trattiamo i dati personali.</p>
            </a>
  
            <a href="/cookie" className="block border rounded-2xl p-5 hover:shadow-md transition">
              <h3 className="font-semibold text-lg mb-2">Cookie Policy</h3>
              <p className="text-sm text-gray-600">Cookie tecnici e funzionamento del sito.</p>
            </a>
          </div>
        </section>
  
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">In sintesi</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="border rounded-2xl p-5">
              <h3 className="font-semibold mb-2">I tuoi contenuti</h3>
              <p className="text-sm text-gray-600">
                I contenuti che carichi restano sotto la tua responsabilità. Devi avere
                il diritto di utilizzare testi, immagini, audio e video inseriti nella piattaforma.
              </p>
            </div>
  
            <div className="border rounded-2xl p-5">
              <h3 className="font-semibold mb-2">Simulazione digitale</h3>
              <p className="text-sm text-gray-600">
                Alcune funzionalità possono generare contenuti o risposte simulate basate
                sui materiali caricati. Non si tratta di una persona reale.
              </p>
            </div>
  
            <div className="border rounded-2xl p-5">
              <h3 className="font-semibold mb-2">Controllo e diritti</h3>
              <p className="text-sm text-gray-600">
                Puoi richiedere accesso, correzione e cancellazione dei tuoi dati secondo
                le funzionalità disponibili e le regole applicabili.
              </p>
            </div>
          </div>
        </section>
  
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Come trattiamo i dati</h2>
          <p className="leading-7 mb-4">
            Trattiamo i dati necessari per creare e gestire il tuo account, consentirti
            l’accesso alla piattaforma, archiviare i contenuti che scegli volontariamente
            di caricare e fornire le funzionalità disponibili del servizio.
          </p>
          <p className="leading-7">
            A seconda dei materiali inseriti, il trattamento può riguardare dati personali
            altamente sensibili o particolarmente delicati sul piano personale. Per questo
            motivo adottiamo un approccio di trasparenza e richiediamo consensi specifici
            nelle fasi iniziali del servizio.
          </p>
        </section>
  
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Contenuti delicati</h2>
          <div className="border rounded-2xl p-5 bg-gray-50">
            <p className="leading-7 mb-4">
              Carica solo contenuti che desideri realmente conservare e per i quali disponi
              delle necessarie autorizzazioni.
            </p>
            <ul className="list-disc pl-6 text-sm text-gray-700 space-y-1">
              <li>testi, immagini, audio e video di cui disponi legittimamente</li>
              <li>contenuti che sei autorizzato a utilizzare</li>
              <li>materiali caricati in modo consapevole</li>
            </ul>
          </div>
        </section>
  
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Uso consapevole del servizio</h2>
          <p className="leading-7">
            UnspokenWords Legacy è uno strumento digitale di memoria personale. Non è
            un servizio medico, psicologico o terapeutico e non sostituisce il supporto
            di professionisti qualificati.
          </p>
        </section>
  
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Accesso ai contenuti e memoria digitale</h2>
          <p className="leading-7">
            La piattaforma può prevedere funzionalità per indicare soggetti autorizzati o
            istruzioni relative alla gestione dei contenuti nel tempo. L’utente resta
            responsabile delle indicazioni fornite.
          </p>
        </section>
  
        <section>
          <h2 className="text-2xl font-semibold mb-4">Contatti</h2>
          <p className="leading-7">
            Per richieste relative a privacy, dati personali, accesso o cancellazione:
          </p>
          <p className="mt-3">
            <strong>Email:</strong> paride.boccellari@unspokenwords.it
          </p>
          <p>
            <strong>Titolare del trattamento:</strong> Paride Boccellari
          </p>
        </section>
      </div>
    )
  }