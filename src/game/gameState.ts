// Game State, Clues, Suspects, and Dialogues for Armstrong Manor Noir

export interface ClueItem {
  id: string;
  name: string;
  category: 'arma' | 'documento' | 'quimico' | 'personal' | 'llave';
  description: string;
  location: string;
  floor: number;
  icon: string;
  discovered: boolean;
  discoveryDate?: string;
  details: string;
}

export interface Suspect {
  id: string;
  name: string;
  role: string;
  floor: number;
  room: string;
  avatarColor: string;
  avatarIcon: string;
  bio: string;
  alibi: string;
  motive: string;
  suspicionLevel: number; // 0 to 100
  interrogated: boolean;
  contradictionExposed: boolean;
  notes: string[];
}

export interface DialogueChoice {
  text: string;
  nextDialogueId: string;
  requiredClueId?: string;
  increasesSuspicion?: number;
  triggerEvent?: string;
  isAccusation?: boolean;
}

export interface DialogueNode {
  id: string;
  speaker: string;
  text: string;
  mood?: 'neutral' | 'nervous' | 'angry' | 'smug' | 'terrified';
  triggerEvent?: string;
  increasesSuspicion?: number;
  choices: DialogueChoice[];
}

export interface GameSettings {
  targetFps: 30 | 60;
  quality: 'performance' | 'balanced' | 'high';
  shadowsEnabled: boolean;
  rainDensity: 'low' | 'medium' | 'high';
}

export interface SaveState {
  version: number;
  timestamp: string;
  floor: number;
  clues: ClueItem[];
  suspects: Suspect[];
  notesCount: number;
}

export interface EndingData {
  id: string;
  title: string;
  subtitle: string;
  verdict: 'Victoria' | 'Tragedia' | 'Corrupción' | 'Fracaso';
  description: string;
  newspaperHeadline: string;
  badgeColor: string;
}

export const INITIAL_CLUES: ClueItem[] = [
  {
    id: 'copa_veneno',
    name: 'Copa de Cristal con Cianuro',
    category: 'quimico',
    description: 'Copa de cristal tallado con posos amargos y olor a almendras amargas.',
    location: 'Despacho de Arthur Armstrong',
    floor: 4,
    icon: 'wine',
    discovered: false,
    details: 'Lord Armstrong bebió de ella justo antes de caer. Contiene restos de cianuro potásico mezclado con láudano.'
  },
  {
    id: 'reloj_roto',
    name: 'Reloj de Bolsillo Parado (11:42 PM)',
    category: 'personal',
    description: 'Reloj de oro de 18k con el cristal quebrado y una abolladura de impacto.',
    location: 'Escena del Crimen, junto al cadáver',
    floor: 4,
    icon: 'watch',
    discovered: false,
    details: 'Las manecillas se detuvieron en seco a las 11:42 PM. Marca la hora exacta del forcejeo mortal.'
  },
  {
    id: 'seda_escarlata',
    name: 'Retal de Seda Escarlata',
    category: 'personal',
    description: 'Fragmento desgarrado de un tejido caro de color rojo intenso.',
    location: 'Enganchado en la ventana del Piso 4',
    floor: 4,
    icon: 'sparkles',
    discovered: false,
    details: 'Coincide con el vestido de cabaret de Madame Vivienne, pero tiene olor a lluvia y hollín de la escalera de emergencia.'
  },
  {
    id: 'frasco_estricnina',
    name: 'Frasco de Alquimista Vacío',
    category: 'quimico',
    description: 'Pequeño frasco de vidrio ámbar con el sello médico del Dr. Thorne.',
    location: 'Papelera del Pasillo del Piso 3',
    floor: 3,
    icon: 'flask-conical',
    discovered: false,
    details: 'La etiqueta raspada aún muestra las siglas "D.T. - Compuesto Letal". Alguien lo sustrajo de su botiquín.'
  },
  {
    id: 'nota_chantaje',
    name: 'Nota de Chantaje a Máquina',
    category: 'documento',
    description: 'Escrita con una máquina de escribir Remington con la letra "e" desalineada.',
    location: 'Cajón secreto del Piso 4',
    floor: 4,
    icon: 'file-text',
    discovered: false,
    details: '"Entregue las escrituras del edificio antes de medianoche o su pasado será público. - V."'
  },
  {
    id: 'registro_conserje',
    name: 'Libro de Visitas del Conserje',
    category: 'documento',
    description: 'El viejo cuaderno de cuero donde Don Teodoro registra subidas del ascensor.',
    location: 'Recepción del Piso 1',
    floor: 1,
    icon: 'book-open',
    discovered: false,
    details: 'A las 11:30 PM, el ascensor subió al Piso 3. A las 11:38 PM alguien subió al Piso 4 por las escaleras sin encender las luces.'
  },
  {
    id: 'pasaporte_falso',
    name: 'Pasaporte Falso a París',
    category: 'documento',
    description: 'Pasaporte falso a nombre de "Victor Delacroix" con sellos falsificados.',
    location: 'Maletín escondido en el Ático (Piso 5)',
    floor: 5,
    icon: 'id-card',
    discovered: false,
    details: 'Contiene un billete para el trasatlántico de las 06:00 AM. La foto es inconfundiblemente de Vincent Navarro.'
  },
  {
    id: 'llave_maestra',
    name: 'Llave Maestra de Latón',
    category: 'llave',
    description: 'Llave vintage de latón que abre las puertas y azotea del edificio.',
    location: 'Cuarto de Calderas del Piso 1',
    floor: 1,
    icon: 'key',
    discovered: false,
    details: 'Don Teodoro jura que la perdió hace tres días cuando un inquilino nuevo se mudó al ático.'
  }
];

export const INITIAL_SUSPECTS: Suspect[] = [
  {
    id: 'conserje',
    name: 'Don Teodoro',
    role: 'Conserje Nocturno del Edificio',
    floor: 1,
    room: 'Conserjería / Lobby',
    avatarColor: '#5c6b73',
    avatarIcon: 'user-check',
    bio: 'Trabaja en el edificio hace 32 años. Conoce los pasos, vicios y secretos de cada inquilino.',
    alibi: 'Afirma haber estado en la recepción limpiando las molduras de bronce y vigilando la lluvia toda la noche.',
    motive: 'Arthur Armstrong amenazaba con despedirlo sin pensión por su avanzada edad.',
    suspicionLevel: 25,
    interrogated: false,
    contradictionExposed: false,
    notes: [
      'Parece asustado pero leal.',
      'Asegura que el ascensor sonó a las 11:30 PM hacia el piso médico.',
      'Admitió haber perdido la llave maestra del edificio hace unos días.'
    ]
  },
  {
    id: 'vivienne',
    name: 'Madame Vivienne',
    role: 'Cantante de Cabaret y Ex-amante',
    floor: 2,
    room: 'Apartamento 201',
    avatarColor: '#b91c1c',
    avatarIcon: 'feather',
    bio: 'Una diva de voz melancólica envuelta en abrigos de piel y cigarrillos perfumados con clavo.',
    alibi: 'Dice que estuvo ensayando sus partituras y bebiendo jerez en su sala hasta la medianoche.',
    motive: 'Armstrong cortó su mecenazgo y amenazaba con dejarla en la ruina y desalojarla.',
    suspicionLevel: 55,
    interrogated: false,
    contradictionExposed: false,
    notes: [
      'Su vestido escarlata favorito tiene un desgarrón en la espalda.',
      'Insiste en que alguien forzó su vestidor mientras bajó al correo.',
      'Tiene un odio visceral hacia Vincent Navarro, a quien llama "una rata chantajista".'
    ]
  },
  {
    id: 'thorne',
    name: 'Dr. Aris Thorne',
    role: 'Médico Residente y Toxicólogo',
    floor: 3,
    room: 'Apartamento 301',
    avatarColor: '#0284c7',
    avatarIcon: 'stethoscope',
    bio: 'Médico taciturno con gafas redondas de montura dorada. Realiza fórmulas químicas en su laboratorio privado.',
    alibi: 'Alega que redactaba fichas clínicas bajo la luz de su quinqué.',
    motive: 'Armstrong descubrió que Thorne practicaba medicina sin licencia actualizada y lo chantajeaba.',
    suspicionLevel: 60,
    interrogated: false,
    contradictionExposed: false,
    notes: [
      'Su gabinete de venenos en el piso 3 fue forzado.',
      'Confiesa que Armstrong le exigía dosis de sedantes fuertes.',
      'Tiene marcas recientes de rasguños en la muñeca izquierda.'
    ]
  },
  {
    id: 'vincent',
    name: 'Vincent Navarro',
    role: 'Huésped Misterioso del Ático',
    floor: 5,
    room: 'Ático 501 / Azotea',
    avatarColor: '#1e293b',
    avatarIcon: 'skull',
    bio: 'Hombre cínico con impermeable oscuro y sombrero calado. Se mueve por las sombras de la ciudad.',
    alibi: 'Afirma que dormía plácidamente pese a los truenos y la gotera del ático.',
    motive: 'Sicario y ladrón contratado por enemigos de Armstrong para robar el testamento original.',
    suspicionLevel: 75,
    interrogated: false,
    contradictionExposed: false,
    notes: [
      'Tiene una maleta lista para zarpar a Europa.',
      'Posee una máquina de escribir portátil en su mesa.',
      'Tiene barro fresco en sus botas, idéntico al de la cornisa del piso 4.'
    ]
  }
];

export const DIALOGUE_TREE: Record<string, DialogueNode> = {
  // --- DON TEODORO (PISO 1) ---
  'teodoro_start': {
    id: 'teodoro_start',
    speaker: 'Don Teodoro',
    text: 'Buenas noches, señor detective. Terrible noche de tormenta para un crimen tan atroz. Lord Armstrong era un hombre duro, pero nadie merece acabar así en su propia suite.',
    mood: 'nervous',
    choices: [
      { text: '¿Quién estuvo merodeando por el edificio cerca de las 11:30 PM?', nextDialogueId: 'teodoro_movimientos' },
      { text: 'Dígame sobre la llave maestra que falta.', nextDialogueId: 'teodoro_llave', requiredClueId: 'llave_maestra' },
      { text: 'Enséñeme el registro del ascensor de esta noche.', nextDialogueId: 'teodoro_registro' },
      { text: 'Volveré a hablar con usted luego.', nextDialogueId: 'exit' }
    ]
  },
  'teodoro_movimientos': {
    id: 'teodoro_movimientos',
    speaker: 'Don Teodoro',
    text: 'A eso de las 11:20 PM vi bajar a Madame Vivienne a buscar correspondencia. Parecía agitada. Luego, el ascensor subió al piso 3 del doctor. Pero... juraría que oí pasos sigilosos subiendo por la escalera de madera hacia el piso 4 poco después.',
    mood: 'neutral',
    choices: [
      { text: '¿Alguien usa las escaleras en lugar del ascensor?', nextDialogueId: 'teodoro_escaleras' },
      { text: '¿Qué opina del inquilino del piso 5, Vincent?', nextDialogueId: 'teodoro_vincent' },
      { text: 'Gracias por el dato, Teodoro.', nextDialogueId: 'teodoro_start' }
    ]
  },
  'teodoro_escaleras': {
    id: 'teodoro_escaleras',
    speaker: 'Don Teodoro',
    text: 'Solo alguien que no quiera que suene la campana del ascensor. Esas viejas tablas de roble crujen como esqueletos, detective. Alguien con pisada pesada subió al piso de Lord Armstrong.',
    choices: [
      { text: 'Interesante. Registraré esas pisadas.', nextDialogueId: 'teodoro_start' }
    ]
  },
  'teodoro_vincent': {
    id: 'teodoro_vincent',
    speaker: 'Don Teodoro',
    text: 'Ese hombre me da mala espina. No saluda, paga siempre en billetes arrugados y lleva una funda abultada bajo el abrigo. Sube y baja a la azotea a todas horas.',
    choices: [
      { text: 'Tendré un ojo bien puesto en él.', nextDialogueId: 'teodoro_start' }
    ]
  },
  'teodoro_llave': {
    id: 'teodoro_llave',
    speaker: 'Don Teodoro',
    text: '¡Por los santos! ¿La encontró en el cuarto de calderas? Hace tres días la dejé sobre el aparador y desapareció misteriosamente tras una visita del señor Vincent.',
    mood: 'terrified',
    choices: [
      { text: 'Esto confirma que el intruso no necesitó forzar la cerradura de Armstrong.', nextDialogueId: 'teodoro_start' }
    ]
  },
  'teodoro_registro': {
    id: 'teodoro_registro',
    speaker: 'Don Teodoro',
    text: 'Aquí tiene el cuaderno, detective. Puede consultarlo en cualquier momento. No borré ni una sola línea, lo juro.',
    triggerEvent: 'unlock_registro',
    choices: [
      { text: 'Guardaré esta información en mi libreta.', nextDialogueId: 'teodoro_start' }
    ]
  },

  // --- MADAME VIVIENNE (PISO 2) ---
  'vivienne_start': {
    id: 'vivienne_start',
    speaker: 'Madame Vivienne',
    text: '¿Un detective en mi vestidor a estas horas? Por favor, sea breve. El dolor de cabeza que me produce esta lluvia y la noticia de Arthur me tienen al borde del colapso.',
    mood: 'smug',
    choices: [
      { text: 'Usted y Lord Armstrong tuvieron una violenta discusión esta tarde.', nextDialogueId: 'vivienne_discusion' },
      { text: 'Explicar este retal de seda escarlata en la escena del crimen.', nextDialogueId: 'vivienne_seda', requiredClueId: 'seda_escarlata' },
      { text: '¿Qué hacía fuera de su habitación a las 11:20 PM?', nextDialogueId: 'vivienne_coartada' },
      { text: 'La dejaré descansar por ahora.', nextDialogueId: 'exit' }
    ]
  },
  'vivienne_discusion': {
    id: 'vivienne_discusion',
    speaker: 'Madame Vivienne',
    text: '¡Arthur era un tirano soberbio! Quería echarme a la calle tras prometer que este apartamento sería mi hogar de por vida. Sí, le grité. Pero jamás mancharía mis manos con su sangre sucia.',
    mood: 'angry',
    choices: [
      { text: 'Tenía motivos suficientes para desear su muerte.', nextDialogueId: 'vivienne_motivo' },
      { text: '¿Conoce a alguien más que quisiera ver muerto a Armstrong?', nextDialogueId: 'vivienne_otros' }
    ]
  },
  'vivienne_motivo': {
    id: 'vivienne_motivo',
    speaker: 'Madame Vivienne',
    text: '¡Medio bajo mundo quería verlo muerto! Pregúntele al borracho del doctor o a la rata del piso 5 que lo vigilaba con prismáticos desde la azotea.',
    choices: [
      { text: 'Anotado en mi libreta.', nextDialogueId: 'vivienne_start' }
    ]
  },
  'vivienne_seda': {
    id: 'vivienne_seda',
    speaker: 'Madame Vivienne',
    text: '¡E-espera! Ese retal... ¡es de mi vestido de gala francés! Pero yo no estuve en su ventana... ¡Alguien entró aquí mientras bajé al lobby y cortó ese trozo para incriminarme! ¡Mire el armario, está forzado!',
    mood: 'terrified',
    increasesSuspicion: -15, // Uncovers setup!
    triggerEvent: 'vivienne_innocent_clue',
    choices: [
      { text: 'Es verdad... las hebras fueron cortadas con navaja, no desgarradas en un forcejeo.', nextDialogueId: 'vivienne_start' }
    ]
  },
  'vivienne_coartada': {
    id: 'vivienne_coartada',
    speaker: 'Madame Vivienne',
    text: 'Fui a revisar el buzón porque esperaba un telegrama urgente de mi agente en París. Don Teodoro puede dar fe de que lo saludé en recepción.',
    choices: [
      { text: 'Eso encaja con las notas del conserje.', nextDialogueId: 'vivienne_start' }
    ]
  },
  'vivienne_otros': {
    id: 'vivienne_otros',
    speaker: 'Madame Vivienne',
    text: 'Vincent Navarro le vendía información a Arthur y luego lo chantajeaba con sus propios trapos sucios. Oí golpes en el piso 4 a las 11:40 PM, seguidos de cristales rotos.',
    choices: [
      { text: 'El reloj se detuvo a las 11:42 PM... encaja.', nextDialogueId: 'vivienne_start' }
    ]
  },

  // --- DR. THORNE (PISO 3) ---
  'thorne_start': {
    id: 'thorne_start',
    speaker: 'Dr. Thorne',
    text: 'Detective. Si busca explicaciones médicas, Lord Armstrong fue envenenado con una neurotoxina fulminante combinada con asfixia. Un método calculador y sin piedad.',
    mood: 'neutral',
    choices: [
      { text: '¿Qué sustancia exacta reconoció en el cuerpo?', nextDialogueId: 'thorne_veneno' },
      { text: 'Encontré este frasco con sus iniciales en la basura.', nextDialogueId: 'thorne_frasco', requiredClueId: 'frasco_estricnina' },
      { text: 'Tiene rasguños recientes en sus muñecas, doctor.', nextDialogueId: 'thorne_rasgunos' },
      { text: 'Permiso, doctor. Continuaré inspeccionando.', nextDialogueId: 'exit' }
    ]
  },
  'thorne_veneno': {
    id: 'thorne_veneno',
    speaker: 'Dr. Thorne',
    text: 'Derivado de cianuro y amapola negra. Una mezcla que yo preparo únicamente para pacientes con dolores terminales de columna... como el propio Armstrong.',
    mood: 'nervous',
    choices: [
      { text: '¿Usted mismo le entregó esa fórmula hoy?', nextDialogueId: 'thorne_formula' },
      { text: '¿Quién más tenía acceso a su laboratorio?', nextDialogueId: 'thorne_acceso' }
    ]
  },
  'thorne_formula': {
    id: 'thorne_formula',
    speaker: 'Dr. Thorne',
    text: '¡No! Se lo advertí a la policía: mi botiquín de seguridad fue vulnerado esta tarde mientras atendía una emergencia en la clínica de la 5ª Avenida.',
    choices: [
      { text: '¿Y no reportó el robo al conserje?', nextDialogueId: 'thorne_start' }
    ]
  },
  'thorne_frasco': {
    id: 'thorne_frasco',
    speaker: 'Dr. Thorne',
    text: '¡Maldita sea! Ese frasco... me lo robaron. Armstrong amenazaba con retirar mi licencia por una negligencia del pasado. Yo tenía miedo, sí... ¡pero soy médico, no un asesino!',
    mood: 'terrified',
    choices: [
      { text: '¿A quién vio merodear cerca de su consultorio?', nextDialogueId: 'thorne_sospechoso' }
    ]
  },
  'thorne_sospechoso': {
    id: 'thorne_sospechoso',
    speaker: 'Dr. Thorne',
    text: 'Vincent Navarro me pidió unas ampollas de morfina la semana pasada. Cuando me negué, me dijo: "Pronto el viejo Arthur no sentirá dolor alguno".',
    choices: [
      { text: 'Vincent parece estar en el epicentro de todo esto.', nextDialogueId: 'thorne_start' }
    ]
  },
  'thorne_rasgunos': {
    id: 'thorne_rasgunos',
    speaker: 'Dr. Thorne',
    text: 'Me corté manipulando una probeta rota cuando descubrí el botiquín forzado. No tengo nada que ocultar. Mis huellas están en mis frascos, pero no en el vaso de Arthur.',
    choices: [
      { text: 'Lo comprobaré.', nextDialogueId: 'thorne_start' }
    ]
  },

  // --- VINCENT NAVARRO (PISO 5 - ÁTICO) ---
  'vincent_start': {
    id: 'vincent_start',
    speaker: 'Vincent Navarro',
    text: 'Mire quién subió hasta las nubes. El ilustre sabueso de la policía. ¿Se le perdió algo entre las goteras de mi humilde ático, detective?',
    mood: 'smug',
    choices: [
      { text: 'Tiene las maletas hechas y un pasaporte falso con salida a las 6 AM.', nextDialogueId: 'vincent_pasaporte', requiredClueId: 'pasaporte_falso' },
      { text: 'La nota de chantaje fue redactada con su máquina de escribir.', nextDialogueId: 'vincent_maquina', requiredClueId: 'nota_chantaje' },
      { text: 'Sus botas tienen barro y hollín de la cornisa del piso 4.', nextDialogueId: 'vincent_botas' },
      { text: '[CONFRONTAR] Sé que tú mataste a Arthur Armstrong.', nextDialogueId: 'vincent_acusacion_final' },
      { text: 'Bajaré a revisar más pistas.', nextDialogueId: 'exit' }
    ]
  },
  'vincent_botas': {
    id: 'vincent_botas',
    speaker: 'Vincent Navarro',
    text: 'Salgo a fumar a la azotea, detective. La noche está húmeda. No es ningún delito contemplar la tormenta sobre los tejados de la ciudad.',
    choices: [
      { text: 'La cornisa del piso 4 da justo al despacho de Arthur.', nextDialogueId: 'vincent_start' }
    ]
  },
  'vincent_maquina': {
    id: 'vincent_maquina',
    speaker: 'Vincent Navarro',
    text: 'Esa chatarra la compré en un mercadillo del puerto. Cualquiera pudo haber entrado a usarla. Armstrong tenía deudas con gente mucho más peligrosa que yo.',
    mood: 'nervous',
    choices: [
      { text: 'La letra "e" tiene el mismo defecto mecánico.', nextDialogueId: 'vincent_start' }
    ]
  },
  'vincent_pasaporte': {
    id: 'vincent_pasaporte',
    speaker: 'Vincent Navarro',
    text: 'Vaya... veo que tiene buenas manos para rebuscar entre mis cosas privadas. Está bien, detective. Seamos pragmáticos como hombres de mundo.',
    mood: 'smug',
    choices: [
      { text: '¿Qué está insinuando, Navarro?', nextDialogueId: 'vincent_propuesta' }
    ]
  },
  'vincent_propuesta': {
    id: 'vincent_propuesta',
    speaker: 'Vincent Navarro',
    text: 'En esa maleta hay 50,000 dólares limpios. Dinero de la caja fuerte de Armstrong que la policía jamás sabrá que existió. Usted me deja bajar por la escalera de incendios, le echa la culpa a la arpía de Vivienne o al viejo conserje... y mañana amanece retirado en Acapulco.',
    mood: 'smug',
    choices: [
      { text: '[ACEPTAR SOBORNO] Trato hecho. Dame el dinero y desaparece.', nextDialogueId: 'final_pacto', triggerEvent: 'ending_pacto' },
      { text: '[RECHAZAR] Tu dinero no lava la sangre de un asesinato. Estás arrestado.', nextDialogueId: 'vincent_arresto_valiente' }
    ]
  },
  'vincent_arresto_valiente': {
    id: 'vincent_arresto_valiente',
    speaker: 'Vincent Navarro',
    text: '¡Maldito héroe incorruptible! ¿Creíste que me dejaría encerrar como una rata en una jaula?',
    mood: 'angry',
    triggerEvent: 'ending_justicia',
    choices: [
      { text: '[REDUCIR AL SOSPECHOSO] ¡Arriba las manos, Navarro!', nextDialogueId: 'final_justicia' }
    ]
  },
  'vincent_acusacion_final': {
    id: 'vincent_acusacion_final',
    speaker: 'Vincent Navarro',
    text: '¿Y qué pruebas sólidas tiene contra mí? ¿Unas sospechas y un cigarrillo mojado? Si no tiene pruebas categóricas, un buen abogado me sacará antes del desayuno.',
    choices: [
      { text: 'Tengo todas las pruebas necesarias para el juez.', nextDialogueId: 'vincent_propuesta', requiredClueId: 'pasaporte_falso' },
      { text: 'Aún necesito asegurar el caso.', nextDialogueId: 'vincent_start' }
    ]
  }
};

export const GAME_ENDINGS: Record<string, EndingData> = {
  justicia_verdadera: {
    id: 'justicia_verdadera',
    title: 'Justicia Implacable',
    subtitle: 'El Caso del Edificio Armstrong ha sido Resuelto',
    verdict: 'Victoria',
    description: 'Confrontaste a Vincent Navarro con el pasaporte falso, la nota de chantaje mecanografiada y el veneno sustraído del consultorio. Pese a su intento de resistencia, la policía acordonó el edificio y lo arrestó en la azotea antes de su fuga a París. Madame Vivienne y el Dr. Thorne quedaron exonerados de culpa.',
    newspaperHeadline: 'CRIMINAL DE GUANTE BLANCO ATRAPADO EN EL ÁTICO TRAS NOCHE DE TERROR',
    badgeColor: '#10b981'
  },
  error_fatal: {
    id: 'error_fatal',
    title: 'Error Judicial Trágico',
    subtitle: 'Una Inocente Condenada en las Sombras',
    verdict: 'Tragedia',
    description: 'Te apresuraste a culpar a Madame Vivienne dejándote llevar por el retal de seda escarlata. Mientras ella lloraba tras las rejas de la comisaría, Vincent Navarro abordaba el trasatlántico rumbo a Francia con la fortuna de la caja fuerte.',
    newspaperHeadline: 'DIVA DE CABARET ENCARCELADA POR EL CRIMEN DE ARMSTRONG - ¿SE HIZO JUSTICIA?',
    badgeColor: '#f59e0b'
  },
  pacto_oscuro: {
    id: 'pacto_oscuro',
    title: 'Pacto de Sombras',
    subtitle: 'El Precio del Silencio en la Ciudad Fría',
    verdict: 'Corrupción',
    description: 'Aceptaste los 50,000 dólares de Vincent Navarro. Desviaste el informe policial culpando a un ladrón fantasma que escapó por el alcantarillado. Tú te marchas con los bolsillos llenos, pero el peso del remordimiento te perseguirá para siempre.',
    newspaperHeadline: 'CASO ARMSTRONG ARCHIVADO SIN CULPABLES CONOCIDOS - EL DETECTIVE SE RETIRA',
    badgeColor: '#8b5cf6'
  },
  fuga_culpable: {
    id: 'fuga_culpable',
    title: 'Sombras en la Niebla',
    subtitle: 'El Asesino se Desvanece en la Noche',
    verdict: 'Fracaso',
    description: 'Tus indecisiones y pasos erráticos dieron tiempo al culpable. Cuando subiste al ático, solo encontraste una ventana abierta, la lluvia entrando a cántaros y la caja fuerte vacía. El criminal escapó sin dejar rastro.',
    newspaperHeadline: 'FUGITIVO BURLA A LA POLICÍA Y HUYE EN LA NOCHE DE TORMENTA',
    badgeColor: '#ef4444'
  }
};
