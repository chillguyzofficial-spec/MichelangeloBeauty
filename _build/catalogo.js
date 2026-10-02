// Michelangelo Beauty — dati del sito (prodotti, ingredienti, lotti, testi di servizio).
// Marchio di fantasia, progetto dimostrativo. Testi scritti secondo Reg. UE 1223/2009 e 655/2013:
// solo effetti cosmetici, niente "non testato su animali", niente "senza chimica", niente risultati inventati.

// Linee: ogni linea ha il suo colore da affresco (bg) e il colore del testo che ci sta sopra (fg)
const LINES = [
  { id: 'viso', name: 'Viso', roman: 'I', bg: '#1F3A6B', fg: '#F6F2EA', pigment: 'blu lapislazzuli' },
  { id: 'corpo', name: 'Corpo', roman: 'II', bg: '#C8902E', fg: '#1C1A17', pigment: 'ocra gialla' },
  { id: 'mani-labbra', name: 'Mani e labbra', roman: 'III', bg: '#A4472F', fg: '#F6F2EA', pigment: 'rosso sanguigna' },
  { id: 'capelli', name: 'Capelli', roman: 'IV', bg: '#5E6B45', fg: '#F6F2EA', pigment: 'verde terra' },
  { id: 'saponi', name: 'Saponi', roman: 'V', bg: '#D9A48E', fg: '#1C1A17', pigment: 'rosa incarnato' },
  { id: 'cofanetti', name: 'Cofanetti', roman: 'VI', bg: '#2B2824', fg: '#F6F2EA', pigment: 'terra d\'ombra' }
];

const PAO_TEXT = { '6M': 'usalo entro sei mesi dalla prima apertura.', '12M': 'usalo entro dodici mesi dalla prima apertura.' };

const P = [
  { id: 'crema-iris', opera: 'I', name: 'Crema viso all\'iris fiorentino', line: 'viso', skin: ['Secca', 'Sensibile'], format: 'Crema', size: '50 ml', price: 28, nat: 98, pao: '6M', lot: 'MB-26-118',
    pairs: ['siero-vinacce', 'balsamo-labbra', 'sapone-calendula'],
    tecnica: 'Emulsione a caldo, lotti da 60 vasetti',
    materiali: 'Iris fiorentino del Chianti, olio d\'oliva, burro di karité',
    lead: 'Una crema morbida con estratto di radice di iris, il giaggiolo delle colline fiorentine. Idrata e lascia la pelle vellutata.',
    desc: 'La radice di iris riposa tre anni prima di essere lavorata: per questo in Toscana la chiamano "l\'oro viola". La uniamo a olio extravergine d\'oliva, burro di karité e squalano vegetale in una crema che si assorbe in fretta e non lascia la pelle lucida. Pensata per pelli secche o sensibili. Non è profumata: il leggero sentore è quello dell\'iris.',
    use: 'Mattina e sera, su viso e collo detersi. Ne basta quanto un pisello: stendila dal centro del viso verso l\'esterno. Al mattino aspetta un minuto prima del trucco.',
    inci: 'Aqua, Olea Europaea Fruit Oil, Glycerin, Butyrospermum Parkii Butter, Iris Florentina Root Extract, Cetearyl Alcohol, Glyceryl Stearate Citrate, Squalane, Sodium Hyaluronate, Xanthan Gum, Tocopherol, Benzyl Alcohol, Dehydroacetic Acid, Helianthus Annuus Seed Oil, Citric Acid',
    keep: 'Vasetto in vetro satinato. Conserva sotto i 25 °C, al riparo da luce e calore, e preleva con mani pulite o con la spatolina.',
    faq: [{ q: 'Va bene per la pelle grassa?', a: 'È leggera, ma la formula è pensata per pelli secche e sensibili. Per una pelle mista o grassa di solito basta il siero alle vinacce, la sera.' }, { q: 'Posso usarla sul contorno occhi?', a: 'Sì, picchiettandone pochissima con l\'anulare, senza arrivare alla rima degli occhi.' }] },

  { id: 'siero-vinacce', opera: 'II', name: 'Siero viso alle vinacce', line: 'viso', skin: ['Secca', 'Sensibile', 'Mista o grassa'], format: 'Olio', size: '30 ml', price: 32, nat: 100, pao: '6M', lot: 'MB-26-121',
    pairs: ['crema-iris', 'sapone-argilla', 'balsamo-labbra'],
    tecnica: 'Miscela a freddo di soli oli, senza acqua',
    materiali: 'Olio di vinaccioli toscani, squalano d\'oliva, jojoba',
    lead: 'Un siero di soli oli: vinaccioli spremuti a freddo dopo la vendemmia, squalano d\'oliva e jojoba. Nutre e lascia la pelle morbida.',
    desc: 'Dopo la vendemmia, dai semi dell\'uva di una cantina vicina si spreme a freddo un olio leggero e chiaro. Lo uniamo a squalano ricavato dalle olive e a olio di jojoba. Una formula anidra, cioè senza acqua, da usare la sera: lascia la pelle morbida ed elastica al tatto. Non è profumato.',
    use: 'La sera, scalda 3-4 gocce tra i palmi e premile su viso e collo puliti, ancora appena umidi. Puoi usarlo da solo o prima della crema.',
    inci: 'Vitis Vinifera Seed Oil, Squalane, Simmondsia Chinensis Seed Oil, Olea Europaea Fruit Oil, Tocopherol, Rosmarinus Officinalis Leaf Extract, Helianthus Annuus Seed Oil',
    keep: 'Flacone in vetro ambrato con contagocce. Tienilo chiuso, lontano da finestre e termosifoni.',
    faq: [{ q: 'Unge?', a: 'Con poche gocce su pelle umida si assorbe in qualche minuto. Per questo lo consigliamo la sera.' }, { q: 'Si può usare con la crema?', a: 'Sì: prima il siero, poi la crema.' }] },

  { id: 'scrub-marmo', opera: 'III', name: 'Scrub corpo al marmo di Carrara', line: 'corpo', skin: ['Secca', 'Mista o grassa'], format: 'Scrub', size: '200 ml', price: 22, nat: 100, pao: '6M', lot: 'MB-26-097',
    pairs: ['olio-lavanda', 'sapone-calendula', 'crema-mani'],
    tecnica: 'Polvere di marmo setacciata e impastata a mano negli oli',
    materiali: 'Polvere di marmo di Carrara, olio d\'oliva, scorza di limone',
    lead: 'La polvere di marmo che resta dalla lavorazione dei blocchi, finissima e setacciata, impastata con olio d\'oliva. Leviga la pelle del corpo e la lascia morbida.',
    desc: 'Nei laboratori di scultura delle Apuane il marmo lascia una polvere bianca e sottile. La setacciamo più volte, finché è liscia al tatto, e la impastiamo con olio extravergine d\'oliva e burro di karité. Sotto la doccia leviga la pelle; quando risciacqui, gli oli restano e la lasciano morbida. Profuma di scorza di limone.',
    use: 'Una o due volte a settimana, sulla pelle bagnata del corpo: massaggia con movimenti circolari, poi risciacqua. Non usarlo sul viso né su pelle irritata o appena depilata.',
    warn: 'Solo per il corpo: non usarlo sul viso né su pelle lesa. Il piatto della doccia può diventare scivoloso, risciacqualo dopo l\'uso.',
    inci: 'Calcium Carbonate, Olea Europaea Fruit Oil, Butyrospermum Parkii Butter, Prunus Amygdalus Dulcis Oil, Polyglyceryl-4 Oleate, Citrus Limon Peel Oil, Tocopherol, Limonene, Citral',
    keep: 'Barattolo in vetro con tappo a vite. Non far entrare acqua nel barattolo: preleva con le mani asciutte o con la spatolina.',
    faq: [{ q: 'È davvero marmo?', a: 'Sì: polvere di marmo bianco, cioè carbonato di calcio, che nell\'INCI trovi come Calcium Carbonate.' }, { q: 'Va bene per la pelle sensibile?', a: 'Per una pelle sensibile è troppo deciso. Meglio il sapone alla calendula e l\'olio alla lavanda.' }] },

  { id: 'olio-lavanda', opera: 'IV', name: 'Olio corpo alla lavanda', line: 'corpo', skin: ['Secca', 'Sensibile', 'Mista o grassa'], format: 'Olio', size: '100 ml', price: 19, nat: 100, pao: '12M', lot: 'MB-26-104',
    pairs: ['scrub-marmo', 'sapone-calendula', 'crema-mani'],
    tecnica: 'Distillazione in bottega e miscela a freddo',
    materiali: 'Lavanda delle colline, olio di mandorle dolci, girasole',
    lead: 'Mandorle dolci e girasole con olio essenziale di lavanda distillata in bottega. Leggero, lascia la pelle morbida e profumata.',
    desc: 'A luglio tagliamo la lavanda sulle colline sopra la bottega e la distilliamo in un piccolo alambicco di rame. L\'olio essenziale va in una base leggera di mandorle dolci e girasole, che si assorbe bene. Lascia la pelle morbida e un profumo discreto. Gli allergeni in fondo all\'INCI sono componenti naturali dell\'olio essenziale.',
    use: 'Dopo la doccia, massaggia su pelle ancora umida. Puoi anche aggiungerne un cucchiaino all\'acqua del bagno.',
    inci: 'Prunus Amygdalus Dulcis Oil, Helianthus Annuus Seed Oil, Lavandula Angustifolia Oil, Tocopherol, Linalool, Limonene, Geraniol, Coumarin',
    keep: 'Flacone in vetro ambrato. Conserva al riparo da luce e calore.',
    faq: [{ q: 'Si può usare sul viso?', a: 'È pensato per il corpo. Per il viso c\'è il siero alle vinacce, non profumato.' }, { q: 'Il bagno diventa scivoloso?', a: 'Un po\' sì: fai attenzione quando esci dalla vasca.' }] },

  { id: 'balsamo-labbra', opera: 'V', name: 'Balsamo labbra alla cera d\'api', line: 'mani-labbra', skin: ['Secca', 'Sensibile', 'Mista o grassa'], format: 'Balsamo', size: '10 ml', price: 7, nat: 100, pao: '12M', lot: 'MB-26-110',
    pairs: ['crema-mani', 'crema-iris', 'sapone-calendula'],
    tecnica: 'Colato a mano in vasetti di vetro satinato',
    materiali: 'Cera d\'api della Garfagnana, burro di karité, calendula',
    lead: 'Cera d\'api di un apicoltore della Garfagnana, burro di karité e olio di ricino. Protegge e ammorbidisce le labbra.',
    desc: 'Un piccolo vasetto di vetro satinato da tenere in borsa. La cera d\'api protegge, il burro di karité e l\'olio di ricino ammorbidiscono le labbra secche, anche d\'inverno. Contiene un macerato di calendula. Non è profumato.',
    use: 'Prendi un po\' di balsamo con la punta del dito e stendilo sulle labbra quando serve. Va bene anche sulle cuticole.',
    inci: 'Butyrospermum Parkii Butter, Ricinus Communis Seed Oil, Cera Alba, Helianthus Annuus Seed Oil, Calendula Officinalis Flower Extract, Tocopherol',
    keep: 'Con il caldo si ammorbidisce: d\'estate non lasciarlo in auto o al sole. Torna solido al fresco.',
    faq: [{ q: 'Va bene per i bambini?', a: 'Gli ingredienti sono semplici, ma per i più piccoli chiedi sempre al pediatra.' }, { q: 'Perché è in ml?', a: 'È il volume del vasetto. Il contenuto è un balsamo solido.' }] },

  { id: 'crema-mani', opera: 'VI', name: 'Crema mani all\'olio d\'oliva', line: 'mani-labbra', skin: ['Secca', 'Sensibile'], format: 'Crema', size: '75 ml', price: 13, nat: 98, pao: '6M', lot: 'MB-26-114',
    pairs: ['balsamo-labbra', 'sapone-calendula', 'olio-lavanda'],
    tecnica: 'Emulsione a caldo, tubetti riempiti a mano',
    materiali: 'Olio extravergine d\'oliva, burro di karité, calendula',
    lead: 'La crema per le mani di chi lavora con le mani: olio d\'oliva e burro di karité, si assorbe senza lasciarle unte.',
    desc: 'L\'abbiamo pensata per noi, che in bottega ci laviamo le mani venti volte al giorno. Olio extravergine d\'oliva di un frantoio della Lucchesia, burro di karité e glicerina, con un estratto di calendula. Ammorbidisce le mani secche e si assorbe in fretta, così puoi tornare subito a quello che stavi facendo. Non è profumata.',
    use: 'Massaggia una piccola quantità sulle mani asciutte, insistendo su nocche e cuticole. Ripeti quando serve, soprattutto dopo averle lavate.',
    inci: 'Aqua, Olea Europaea Fruit Oil, Butyrospermum Parkii Butter, Glycerin, Cetearyl Alcohol, Glyceryl Stearate, Sodium Stearoyl Lactylate, Calendula Officinalis Flower Extract, Xanthan Gum, Tocopherol, Benzyl Alcohol, Dehydroacetic Acid, Citric Acid',
    keep: 'Tubetto in alluminio. Conserva al riparo da calore e sole diretto e chiudi bene il tappo.',
    faq: [{ q: 'Lascia le mani unte?', a: 'Per qualche istante, poi si assorbe. Se ne metti poca si assorbe subito.' }, { q: 'Si può usare sul corpo?', a: 'Sì, su gomiti e talloni secchi.' }] },

  { id: 'sapone-calendula', opera: 'VII', name: 'Sapone all\'olio d\'oliva e calendula', line: 'saponi', skin: ['Secca', 'Sensibile', 'Mista o grassa'], format: 'Solido', size: '100 g', price: 8.5, nat: 100, pao: '12M', lot: 'MB-26-089',
    pairs: ['crema-mani', 'olio-lavanda', 'balsamo-labbra'],
    tecnica: 'Saponificazione a freddo, sei settimane di stagionatura',
    materiali: 'Olio extravergine d\'oliva, burro di karité, petali di calendula',
    lead: 'Fatto a freddo con olio d\'oliva, burro di karité e calendula. Deterge delicatamente viso e corpo.',
    desc: 'Olio d\'oliva, olio di cocco e burro di karité saponificati a freddo, con un macerato di calendula e qualche petalo. Ogni panetto stagiona sei settimane su scaffali di castagno prima di essere pronto. La schiuma è morbida e deterge delicatamente, lasciando la pelle morbida. Non è profumato.',
    use: 'Inumidisci sapone e pelle, crea la schiuma tra le mani, massaggia e risciacqua. Tra un uso e l\'altro lascialo asciugare su un portasapone che fa scolare l\'acqua: dura di più.',
    inci: 'Sodium Olivate, Sodium Cocoate, Aqua, Sodium Shea Butterate, Sodium Castorate, Glycerin, Olea Europaea Fruit Oil, Calendula Officinalis Flower Extract, Calendula Officinalis Flower, Tocopherol, Helianthus Annuus Seed Oil',
    keep: 'Conserva in un luogo asciutto. Lontano dall\'acqua della doccia resta compatto più a lungo.',
    faq: [{ q: 'Si può usare sul viso?', a: 'Sì, evitando il contatto con gli occhi.' }, { q: 'Perché il colore cambia da un lotto all\'altro?', a: 'Dipende dai fiori raccolti in quel periodo. La ricetta è la stessa.' }] },

  { id: 'sapone-argilla', opera: 'VIII', name: 'Sapone all\'argilla e rosmarino', line: 'saponi', skin: ['Mista o grassa'], format: 'Solido', size: '100 g', price: 8.5, nat: 100, pao: '12M', lot: 'MB-26-092',
    pairs: ['siero-vinacce', 'shampoo-rosmarino', 'scrub-marmo'],
    tecnica: 'Saponificazione a freddo, sei settimane di stagionatura',
    materiali: 'Argilla verde, olio d\'oliva, rosmarino',
    lead: 'Argilla verde e olio essenziale di rosmarino in un sapone a freddo. Una schiuma decisa per pelli miste e grasse.',
    desc: 'Olio d\'oliva, olio di cocco e olio di ricino saponificati a freddo, con argilla verde e olio essenziale di rosmarino. Deterge a fondo le pelli miste e grasse e lascia un profumo erbaceo, come le siepi di rosmarino intorno alla bottega. Gli allergeni in fondo all\'INCI sono componenti naturali dell\'olio essenziale.',
    use: 'Inumidisci sapone e pelle, crea la schiuma tra le mani, massaggia e risciacqua con cura. Lascialo asciugare su un portasapone che fa scolare l\'acqua.',
    warn: 'Evita il contatto con gli occhi.',
    inci: 'Sodium Olivate, Sodium Cocoate, Aqua, Sodium Castorate, Glycerin, Illite, Olea Europaea Fruit Oil, Rosmarinus Officinalis Leaf Oil, Tocopherol, Limonene, Linalool',
    keep: 'Conserva in un luogo asciutto, lontano dall\'acqua della doccia.',
    faq: [{ q: 'Secca la pelle?', a: 'Su pelli secche può risultare troppo deciso: per quelle consigliamo il sapone alla calendula.' }, { q: 'Si usa anche sul corpo?', a: 'Sì, è adatto a viso e corpo.' }] },

  { id: 'shampoo-rosmarino', opera: 'IX', name: 'Shampoo solido al rosmarino', line: 'capelli', skin: ['Mista o grassa'], format: 'Solido', size: '70 g', price: 12, nat: 99, pao: '12M', lot: 'MB-26-101',
    pairs: ['sapone-argilla', 'olio-lavanda', 'crema-mani'],
    tecnica: 'Pressato a mano in stampi di legno',
    materiali: 'Rosmarino, caolino, burro di cacao',
    lead: 'Rosmarino, caolino e burro di cacao in un panetto che lava con delicatezza i capelli che si ungono in fretta.',
    desc: 'Uno shampoo solido con un tensioattivo delicato di origine vegetale, burro di cacao e caolino, l\'argilla bianca. L\'olio essenziale di rosmarino gli dà un profumo erbaceo. Lava con delicatezza e lascia i capelli leggeri. In viaggio occupa pochissimo spazio e non teme i controlli in aeroporto.',
    use: 'Bagna bene i capelli e il panetto, passalo due o tre volte sulla cute e massaggia con le dita. Risciacqua con cura. Lascia asciugare il panetto fuori dalla doccia.',
    inci: 'Sodium Cocoyl Isethionate, Cetearyl Alcohol, Theobroma Cacao Seed Butter, Coco-Glucoside, Kaolin, Glycerin, Panthenol, Rosmarinus Officinalis Leaf Oil, Citric Acid, Tocopherol, Limonene, Linalool',
    keep: 'Conserva asciutto, su un portasapone forato o in una scatolina di latta con fori.',
    faq: [{ q: 'Fa schiuma?', a: 'Sì, una schiuma fitta, soprattutto al secondo passaggio.' }, { q: 'Va bene per i capelli colorati?', a: 'Sì, è delicato. Se hai dubbi fai una prova su una ciocca.' }] },

  { id: 'cofanetto-bottega', opera: 'X', name: 'Cofanetto regalo "La bottega"', line: 'cofanetti', skin: ['Secca', 'Sensibile', 'Mista o grassa'], format: 'Cofanetto', size: '4 opere', price: 45, pao: '6M e 12M', lot: null,
    contents: ['sapone-calendula', 'crema-mani', 'balsamo-labbra', 'olio-lavanda'],
    pairs: ['crema-iris', 'scrub-marmo', 'shampoo-rosmarino'],
    tecnica: 'Scatola di cartone pressato, chiusa con nastro di cotone',
    materiali: 'Quattro opere della bottega, carta velina, biglietto scritto a mano',
    lead: 'Quattro opere per un rituale semplice, in una scatola chiusa con nastro di cotone. Comprate una per una costerebbero 47,50 €.',
    desc: 'Dentro trovi: sapone all\'olio d\'oliva e calendula 100 g, crema mani all\'olio d\'oliva 75 ml, balsamo labbra alla cera d\'api 10 ml, olio corpo alla lavanda 100 ml. Se è un regalo, aggiungi la confezione con biglietto scritto a mano nel carrello: non mettiamo lo scontrino nel pacco.',
    use: 'Sapone e olio per la doccia della sera, crema mani e balsamo da tenere in borsa. Ogni opera ha le sue istruzioni sulla confezione.',
    keep: 'Ogni opera ha il suo PAO: 6M per la crema mani, 12M per le altre. Conserva tutto al riparo da luce e calore.',
    faq: [{ q: 'Posso cambiare le opere nel cofanetto?', a: 'Non ancora. Scrivici: per ordini di più cofanetti possiamo parlarne.' }, { q: 'Arriva già incartato?', a: 'Sì, la scatola è chiusa con nastro di cotone.' }] }
];

const ALLERG = 'Componente naturale degli oli essenziali. È un allergene che la legge chiede di indicare: utile se sai di esserne sensibile.';
// INCI leggibile: nome INCI → [nome comune, da dove viene e a cosa serve]
const GLOSS = {
  'Aqua': ['Acqua', 'Scioglie gli ingredienti e rende la crema leggera.'],
  'Olea Europaea Fruit Oil': ['Olio extravergine d\'oliva', 'Da un frantoio della Lucchesia. Emolliente: ammorbidisce la pelle.'],
  'Glycerin': ['Glicerina vegetale', 'Umettante: aiuta la pelle a trattenere l\'acqua.'],
  'Butyrospermum Parkii Butter': ['Burro di karité', 'Dai semi di un albero africano. Nutre e ammorbidisce.'],
  'Iris Florentina Root Extract': ['Estratto di radice di iris', 'Il giaggiolo delle colline fiorentine, la cui radice riposa tre anni prima di essere lavorata. Idrata e lascia la pelle vellutata.'],
  'Cetearyl Alcohol': ['Alcol cetearilico', 'Un alcol grasso di origine vegetale: dà corpo alla crema e non secca la pelle.'],
  'Glyceryl Stearate Citrate': ['Emulsionante vegetale', 'Tiene insieme acqua e oli.'],
  'Glyceryl Stearate': ['Emulsionante vegetale', 'Tiene insieme acqua e oli.'],
  'Sodium Stearoyl Lactylate': ['Emulsionante', 'Tiene insieme acqua e oli e rende la crema più stabile.'],
  'Squalane': ['Squalano vegetale', 'Ricavato dalle olive. Emolliente leggero, si assorbe in fretta.'],
  'Sodium Hyaluronate': ['Sale dell\'acido ialuronico', 'Umettante: trattiene l\'acqua sulla superficie della pelle.'],
  'Xanthan Gum': ['Gomma xantana', 'Addensante ottenuto dalla fermentazione degli zuccheri.'],
  'Tocopherol': ['Vitamina E', 'Antiossidante: protegge gli oli dall\'irrancidimento.'],
  'Benzyl Alcohol': ['Alcol benzilico', 'Conservante: mantiene la crema sicura dopo l\'apertura.'],
  'Dehydroacetic Acid': ['Acido deidroacetico', 'Conservante, usato insieme all\'alcol benzilico.'],
  'Helianthus Annuus Seed Oil': ['Olio di girasole', 'Emolliente. È anche l\'olio in cui maceriamo i fiori.'],
  'Citric Acid': ['Acido citrico', 'Regola il pH della formula.'],
  'Vitis Vinifera Seed Oil': ['Olio di vinaccioli', 'Spremuto a freddo dai semi dell\'uva dopo la vendemmia. Leggero, nutre senza appesantire.'],
  'Simmondsia Chinensis Seed Oil': ['Olio di jojoba', 'In realtà una cera liquida. Leggero, non lascia la pelle lucida.'],
  'Rosmarinus Officinalis Leaf Extract': ['Estratto di rosmarino', 'Antiossidante: aiuta a conservare gli oli.'],
  'Calcium Carbonate': ['Polvere di marmo', 'Carbonato di calcio: la polvere bianca del marmo di Carrara, setacciata finissima. Leviga la pelle.'],
  'Prunus Amygdalus Dulcis Oil': ['Olio di mandorle dolci', 'Emolliente: ammorbidisce la pelle.'],
  'Polyglyceryl-4 Oleate': ['Emulsionante vegetale', 'Permette agli oli di sciogliersi nell\'acqua quando risciacqui.'],
  'Citrus Limon Peel Oil': ['Olio essenziale di scorza di limone', 'Profuma di agrumi.'],
  'Lavandula Angustifolia Oil': ['Olio essenziale di lavanda', 'Distillato in bottega dalla lavanda delle colline. Profuma.'],
  'Linalool': ['Linalolo', ALLERG], 'Limonene': ['Limonene', ALLERG], 'Geraniol': ['Geraniolo', ALLERG], 'Coumarin': ['Cumarina', ALLERG], 'Citral': ['Citrale', ALLERG],
  'Ricinus Communis Seed Oil': ['Olio di ricino', 'Denso e lucido: ammorbidisce e dà corpo al balsamo.'],
  'Cera Alba': ['Cera d\'api', 'Da un apicoltore della Garfagnana. Protegge e rende solido il balsamo.'],
  'Calendula Officinalis Flower Extract': ['Estratto di calendula', 'Fiori macerati in olio. Ammorbidisce.'],
  'Calendula Officinalis Flower': ['Petali di calendula', 'Interi, per decorare il sapone.'],
  'Sodium Olivate': ['Olio d\'oliva saponificato', 'La base del sapone: olio d\'oliva trasformato in sapone a freddo.'],
  'Sodium Cocoate': ['Olio di cocco saponificato', 'Dà una schiuma abbondante.'],
  'Sodium Shea Butterate': ['Burro di karité saponificato', 'Rende il sapone più cremoso.'],
  'Sodium Castorate': ['Olio di ricino saponificato', 'Rende la schiuma più stabile.'],
  'Illite': ['Argilla verde', 'Assorbe il sebo in eccesso.'],
  'Rosmarinus Officinalis Leaf Oil': ['Olio essenziale di rosmarino', 'Profumo erbaceo.'],
  'Sodium Cocoyl Isethionate': ['Tensioattivo da cocco', 'Lava con delicatezza e fa una schiuma fitta.'],
  'Theobroma Cacao Seed Butter': ['Burro di cacao', 'Rende il panetto compatto e ammorbidisce i capelli.'],
  'Coco-Glucoside': ['Tensioattivo da cocco e zuccheri', 'Delicato, aiuta la schiuma.'],
  'Kaolin': ['Caolino, argilla bianca', 'Assorbe il sebo in eccesso dalla cute.'],
  'Panthenol': ['Provitamina B5', 'Rende i capelli più morbidi e facili da pettinare.']
};

// Traccia il tuo lotto: codice → dati del lotto
const LOTS = {
  'MB-26-118': { id: 'crema-iris', date: '14 settembre 2026', pieces: 60, maker: 'Livia', origin: [['Iris', 'radici di un campo del Chianti, essiccate per tre anni'], ['Olio d\'oliva', 'frantoio della Lucchesia, raccolta 2025']], best: 'settembre 2028' },
  'MB-26-121': { id: 'siero-vinacce', date: '22 settembre 2026', pieces: 40, maker: 'Livia', origin: [['Olio di vinaccioli', 'semi della vendemmia 2025 di una cantina delle colline lucchesi'], ['Rosmarino', 'siepe della bottega, raccolto a settembre 2026']], best: 'marzo 2028' },
  'MB-26-097': { id: 'scrub-marmo', date: '4 agosto 2026', pieces: 50, maker: 'Tommaso', origin: [['Polvere di marmo', 'laboratorio di scultura delle Apuane, setacciata tre volte'], ['Olio d\'oliva', 'frantoio della Lucchesia, raccolta 2025']], best: 'febbraio 2028' },
  'MB-26-104': { id: 'olio-lavanda', date: '28 agosto 2026', pieces: 60, maker: 'Livia', origin: [['Lavanda', 'colline sopra la bottega, tagliata a luglio 2026 e distillata in rame']], best: 'agosto 2028' },
  'MB-26-110': { id: 'balsamo-labbra', date: '5 settembre 2026', pieces: 120, maker: 'Tommaso', origin: [['Cera d\'api', 'apicoltore della Garfagnana'], ['Calendula', 'raccolta a giugno 2026']], best: 'settembre 2028' },
  'MB-26-114': { id: 'crema-mani', date: '10 settembre 2026', pieces: 80, maker: 'Livia', origin: [['Olio d\'oliva', 'frantoio della Lucchesia, raccolta 2025'], ['Calendula', 'raccolta ad agosto 2026']], best: 'settembre 2028' },
  'MB-26-089': { id: 'sapone-calendula', date: '20 luglio 2026', cure: 'pronto dal 31 agosto, dopo sei settimane di stagionatura', pieces: 72, maker: 'Tommaso', origin: [['Olio d\'oliva', 'frantoio della Lucchesia, raccolta 2025'], ['Calendula', 'petali raccolti a giugno 2026']], best: 'luglio 2028' },
  'MB-26-092': { id: 'sapone-argilla', date: '27 luglio 2026', cure: 'pronto dal 7 settembre, dopo sei settimane di stagionatura', pieces: 72, maker: 'Tommaso', origin: [['Rosmarino', 'olio essenziale da un distillatore della Maremma'], ['Olio d\'oliva', 'frantoio della Lucchesia, raccolta 2025']], best: 'luglio 2028' },
  'MB-26-101': { id: 'shampoo-rosmarino', date: '18 agosto 2026', pieces: 90, maker: 'Tommaso', origin: [['Rosmarino', 'olio essenziale da un distillatore della Maremma']], best: 'agosto 2028' }
};

const PEOPLE = [
  { id: 'livia', name: 'Livia Bardelli', role: 'Ricette e controllo dei lotti', text: 'Laureata in chimica a Pisa, ha lavorato dieci anni in un laboratorio cosmetico prima di tornare sulle colline dove è cresciuta. Scrive le ricette, distilla la lavanda e controlla ogni lotto prima che parta.' },
  { id: 'tommaso', name: 'Tommaso Viviani', role: 'Saponi, panetti e spedizioni', text: 'Figlio di un marmista di Pietrasanta, ha imparato da ragazzo a lavorare con le mani. Taglia i saponi, setaccia la polvere di marmo, prepara i pacchi e risponde a gran parte delle vostre email.' }
];

const STEPS = [
  ['Raccolta', 'Raccogliamo le erbe al mattino, quando la rugiada si è asciugata, e le facciamo seccare all\'ombra su telai di legno.'],
  ['Macerazione', 'Fiori e foglie restano in olio d\'oliva dalle quattro alle sei settimane. Poi filtriamo a mano, attraverso un telo di lino.'],
  ['Pesatura', 'Ogni ricetta ha la sua scheda. Pesiamo le materie prime al decimo di grammo e annotiamo tutto nel registro del lotto.'],
  ['Colata e riposo', 'Creme e oli vanno subito in vetro. I saponi riposano sei settimane su scaffali di castagno prima di essere pronti.'],
  ['Numero d\'opera', 'Ogni confezione riceve il numero del suo lotto. Di ogni lotto teniamo un campione per tutta la sua durata.']
];

const FAQS = [
  { q: 'Come capisco se un prodotto è adatto alla mia pelle?', a: 'Prova "Componi il tuo rituale": tre domande e ti proponiamo due o tre opere, con il perché. Nel negozio puoi anche filtrare per tipo di pelle. Se hai dubbi scrivici: rispondiamo noi due, non un sistema automatico.' },
  { q: 'Che cos\'è l\'INCI e perché le parole si possono toccare?', a: 'L\'INCI è l\'elenco degli ingredienti, con i nomi internazionali in latino e in inglese. È obbligatorio, ma quasi nessuno lo capisce: per questo nelle nostre schede ogni ingrediente si tocca e ti dice in italiano cos\'è e a cosa serve.' },
  { q: 'Quanto durano i prodotti?', a: 'Lo dice il PAO, il disegno del vasetto aperto con 6M o 12M: sono i mesi in cui va usato dopo l\'apertura. Chiusi e conservati al fresco, durano fino alla data della scheda del lotto.' },
  { q: 'Perché ogni prodotto ha un numero di lotto?', a: 'Facciamo pochi pezzi alla volta. Inserendo il numero nella pagina "Traccia il tuo lotto" vedi quando è stato fatto, da chi e da dove arrivano gli ingredienti principali.' },
  { q: 'Perché vi chiamate Michelangelo?', a: 'È un omaggio al modo di lavorare delle botteghe toscane: materia, mani e tempo. Non abbiamo alcun legame con l\'artista, con i suoi eredi o con i musei.' },
  { q: 'I prodotti sono profumati?', a: 'La maggior parte no. Alcuni contengono oli essenziali, come lavanda, limone o rosmarino: gli allergeni che contengono sono indicati in fondo all\'INCI.' },
  { q: 'Posso fare un regalo?', a: 'Sì: nel carrello puoi aggiungere la confezione regalo con biglietto scritto a mano (3 €). Non mettiamo lo scontrino nel pacco.' },
  { q: 'Spedite all\'estero?', a: 'Per ora solo in Italia. Spedizione gratuita da 49 €, consegna in 2-4 giorni lavorativi.' }
];

const SELLER = 'Michelangelo Beauty Bottega s.n.c., Via della Bottega 0, 55000 Colline Apuane (LU), P.IVA 00000000000, bottega@michelangelobeauty.example, tel. 000 000 0000 (dati di fantasia)';
const EMAIL = 'bottega@michelangelobeauty.example';

const LEGAL = {
  'condizioni-vendita': { title: 'Condizioni di vendita', sections: [
    ['1. Venditore', 'Le presenti condizioni regolano la vendita a distanza dei prodotti presentati su questo sito da parte di ' + SELLER + '.'],
    ['2. Prodotti e prezzi', 'Le caratteristiche essenziali dei prodotti, compreso l\'elenco degli ingredienti, sono descritte nelle singole schede. I prezzi sono in euro, IVA inclusa. Le spese di spedizione sono indicate prima della conferma dell\'ordine.'],
    ['3. Conclusione del contratto', 'Il contratto si conclude quando ricevi l\'email di conferma dell\'ordine, che riepiloga prodotti, prezzi, spese di consegna e queste condizioni.'],
    ['4. Pagamento', 'Accettiamo carte di credito e di debito tramite un fornitore di pagamento sicuro e bonifico bancario. Con il bonifico l\'ordine viene preparato al ricevimento del pagamento.'],
    ['5. Consegna', 'Spediamo in Italia in 2-4 giorni lavorativi con il servizio standard e in 1-2 giorni con il servizio espresso. Il rischio di perdita o danneggiamento passa a te alla consegna.'],
    ['6. Diritto di recesso', 'Puoi recedere entro 14 giorni dalla consegna senza indicare il motivo, secondo gli articoli 52 e seguenti del Codice del Consumo. Il recesso è escluso per i prodotti sigillati aperti dopo la consegna, che non si prestano a essere restituiti per motivi igienici (art. 59). Le modalità sono descritte nella pagina Spedizioni e resi.'],
    ['7. Garanzia legale di conformità', 'Tutti i prodotti godono della garanzia legale di conformità di 24 mesi prevista dagli articoli 128 e seguenti del Codice del Consumo.'],
    ['8. Legge applicabile e reclami', 'Il contratto è regolato dalla legge italiana. Per reclami scrivi a ' + EMAIL + ': rispondiamo entro 10 giorni lavorativi. Per le controversie è competente il foro del luogo di residenza del consumatore.']
  ] },
  'privacy': { title: 'Informativa privacy', sections: [
    ['Titolare del trattamento', SELLER + '.'],
    ['Dati che trattiamo', 'Dati anagrafici e di contatto, indirizzo di consegna, dati dell\'ordine e messaggi che ci invii. I dati di pagamento sono gestiti direttamente dal fornitore del servizio di pagamento e non passano da noi.'],
    ['Finalità e basi giuridiche', 'Gestire ordini, spedizioni e resi (esecuzione del contratto); adempiere agli obblighi fiscali (obbligo di legge); inviarti la newsletter, solo se ti iscrivi (consenso, revocabile in ogni momento).'],
    ['Conservazione', 'I dati degli ordini per 10 anni, come richiesto dalla normativa fiscale. I dati della newsletter fino alla cancellazione dell\'iscrizione.'],
    ['Destinatari', 'Corrieri, fornitore del servizio di pagamento, commercialista e fornitore dell\'infrastruttura del sito, nominati responsabili del trattamento quando necessario.'],
    ['I tuoi diritti', 'Puoi chiedere accesso, rettifica, cancellazione, limitazione, portabilità e opporti al trattamento scrivendo a ' + EMAIL + '. Puoi anche presentare reclamo al Garante per la protezione dei dati personali.']
  ] },
  'cookie': { title: 'Cookie policy', sections: [
    ['Cosa sono i cookie', 'Piccoli file che il sito salva nel tuo browser per funzionare o per raccogliere informazioni sulla navigazione.'],
    ['Cosa usiamo', 'Solo strumenti tecnici: la memoria del browser serve a ricordare il contenuto del carrello. Non richiede il consenso.'],
    ['Cosa non usiamo', 'Non usiamo cookie di profilazione né strumenti pubblicitari di terze parti. Per questo all\'ingresso non compare alcun banner.'],
    ['Come gestirli', 'Puoi cancellare i dati del sito dalle impostazioni del browser. Se lo fai, il carrello si svuota.']
  ] }
};

module.exports = { LINES, P, PAO_TEXT, GLOSS, LOTS, PEOPLE, STEPS, FAQS, SELLER, EMAIL, LEGAL };
