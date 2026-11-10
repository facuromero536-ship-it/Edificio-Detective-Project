// Multi-Case & Mini-City Data for Armstrong Manor & Noir City (Zero external dependencies)
import { ClueItem, Suspect, DialogueNode, EndingData } from './gameState';

export type LocationType = 'city' | 'armstrong' | 'bookstore' | 'hospital' | 'school';

export interface LocationInfo {
  id: LocationType;
  name: string;
  shortDesc: string;
  caseTitle: string;
  icon: string;
  color: string;
  streetCoords: { x: number; z: number };
}

export const CITY_LOCATIONS: LocationInfo[] = [
  {
    id: 'armstrong',
    name: 'Edificio Armstrong (5 Pisos)',
    shortDesc: 'Mansión victoriana de apartamentos de 5 plantas. Escena del crimen de Lord Arthur.',
    caseTitle: 'Caso 1: El Asesinato del Magnate',
    icon: 'building',
    color: '#d97706',
    streetCoords: { x: -8, z: -8 }
  },
  {
    id: 'bookstore',
    name: 'Librería "El Cuervo y la Llave"',
    shortDesc: 'Antigua librería de manuscritos raros, pergaminos arcanos y archivos sellados.',
    caseTitle: 'Caso 2: El Códice Envenenado',
    icon: 'book-open',
    color: '#10b981',
    streetCoords: { x: 8, z: -8 }
  },
  {
    id: 'hospital',
    name: 'Hospital Santa Elena & Morgue',
    shortDesc: 'Clínica municipal y depósito de cadáveres envuelto en niebla química.',
    caseTitle: 'Caso 3: La Desaparición del Cirujano',
    icon: 'activity',
    color: '#38bdf8',
    streetCoords: { x: -8, z: 8 }
  },
  {
    id: 'school',
    name: 'Academia San Judas',
    shortDesc: 'Colegio y biblioteca gótica con secretos en la bóveda del rectorado.',
    caseTitle: 'Caso 4: El Secreto de la Bóveda',
    icon: 'graduation-cap',
    color: '#a855f7',
    streetCoords: { x: 8, z: 8 }
  }
];

export interface PedestrianNPC {
  id: string;
  name: string;
  role: string;
  position: { x: number; z: number };
  color: string;
  dialogueId: string;
}

export const CITY_PEDESTRIANS: PedestrianNPC[] = [
  {
    id: 'ped_periodista',
    name: 'Tommy "El Canillita"',
    role: 'Vendedor de periódicos nocturno',
    position: { x: -1.5, z: -1.5 },
    color: '#f59e0b',
    dialogueId: 'ped_tommy_dialogue'
  },
  {
    id: 'ped_dama',
    name: 'Clara "La Dama del Paraguas"',
    role: 'Testigo callejera elegante',
    position: { x: 2.5, z: -6.0 },
    color: '#ef4444',
    dialogueId: 'ped_clara_dialogue'
  },
  {
    id: 'ped_policia',
    name: 'Agente Morales',
    role: 'Patrullero del distrito policial',
    position: { x: -5.0, z: 4.5 },
    color: '#3b82f6',
    dialogueId: 'ped_morales_dialogue'
  },
  {
    id: 'ped_vagabundo',
    name: 'Viejo Sam',
    role: 'Habitante nocturno de los callejones',
    position: { x: 6.0, z: 5.5 },
    color: '#8b5cf6',
    dialogueId: 'ped_sam_dialogue'
  }
];

// Additional Clues for Bookstore, Hospital, and School
export const ADDITIONAL_CLUES: ClueItem[] = [
  // Bookstore Clues
  {
    id: 'codice_antiguo',
    name: 'Manuscrito Raro con Manchas',
    category: 'documento',
    description: 'Tomo encuadernado en cuero negro con bordes carcomidos por ácido.',
    location: 'Atril principal de la Librería El Cuervo',
    floor: 1,
    icon: 'book-open',
    discovered: false,
    details: 'Las páginas 44 y 45 fueron arrancadas cuidadosamente con bisturí. Trata sobre tóxicos vegetales de Oriente.'
  },
  {
    id: 'recibo_compra',
    name: 'Factura Falsificada de Libros',
    category: 'documento',
    description: 'Factura con la firma imitada de Arthur Armstrong por 10,000 francos.',
    location: 'Caja registradora de la Librería',
    floor: 1,
    icon: 'file-text',
    discovered: false,
    details: 'El librero Crowley cobró una suma astronómica por supuestas obras de arte nunca entregadas.'
  },
  // Hospital Clues
  {
    id: 'informe_autopsia',
    name: 'Expediente Quirúrgico Confidencial',
    category: 'documento',
    description: 'Carpeta de metal con sello rojo del Hospital Santa Elena.',
    location: 'Mesa de operaciones de la Morgue',
    floor: 1,
    icon: 'file-text',
    discovered: false,
    details: 'Detalla una intervención ilegal de cambio de identidad facial programada para esta madrugada.'
  },
  {
    id: 'bisturi_manchado',
    name: 'Bisturí de Plata con Resina',
    category: 'arma',
    description: 'Instrumental quirúrgico esterilizado pero con restos de cera de lacre.',
    location: 'Bandeja metálica del Hospital',
    floor: 1,
    icon: 'sparkles',
    discovered: false,
    details: 'Fue utilizado para cortar la seda del vestido de Madame Vivienne y forzar cerraduras antiguas.'
  },
  // School Clues
  {
    id: 'llave_boveda_rector',
    name: 'Llave de Hierro Forjado de la Academia',
    category: 'llave',
    description: 'Pesada llave de la cripta y archivo histórico del rector.',
    location: 'Despacho del Rector en la Academia',
    floor: 1,
    icon: 'key',
    discovered: false,
    details: 'Abre el cofre secreto donde se custodiaba el testamento alternativo de la familia Armstrong.'
  },
  {
    id: 'plano_tuneles',
    name: 'Plano Secreto de Túneles de la Ciudad',
    category: 'documento',
    description: 'Mapa de 1890 con túneles subterráneos que unen la escuela con el Edificio Armstrong.',
    location: 'Pizarra de la Academia San Judas',
    floor: 1,
    icon: 'file-text',
    discovered: false,
    details: 'Muestra un pasaje directo entre el cuarto de calderas del edificio y la cripta de la escuela.'
  }
];

// Additional Suspects for other locations
export const ADDITIONAL_SUSPECTS: Suspect[] = [
  {
    id: 'crowley',
    name: 'Gideon Crowley',
    role: 'Anticuario y Dueño de la Librería',
    floor: 1,
    room: 'Librería "El Cuervo"',
    avatarColor: '#059669',
    avatarIcon: 'book-open',
    bio: 'Erudito de modales refinados y mirada esquiva. Trafica con cartas privadas y códices robados.',
    alibi: 'Afirma que catalogaba primeras ediciones hasta la medianoche con música clásica.',
    motive: 'Armstrong amenazaba con entregarlo a la policía por estafa de antigüedades.',
    suspicionLevel: 50,
    interrogated: false,
    contradictionExposed: false,
    notes: [
      'Tiene dedos manchados de tinta y olor a alcanfor.',
      'Vendió la máquina de escribir defectuosa a Vincent Navarro.'
    ]
  },
  {
    id: 'beatrice',
    name: 'Enfermera Beatrice',
    role: 'Jefa de Turno de la Morgue del Hospital',
    floor: 1,
    room: 'Morgue de Santa Elena',
    avatarColor: '#0284c7',
    avatarIcon: 'activity',
    bio: 'Mujer severa que administra el suministro de sedantes y certificados de defunción.',
    alibi: 'Estaba de guardia en la sala de admisión durante la tormenta.',
    motive: 'Recibió un soborno para declarar la muerte de Armstrong como "ataque cardíaco natural".',
    suspicionLevel: 65,
    interrogated: false,
    contradictionExposed: false,
    notes: [
      'Ocultaba una copia no registrada del frasco de veneno en su casillero.',
      'Admite que Vincent Navarro la visitó a las 10:45 PM.'
    ]
  },
  {
    id: 'vane',
    name: 'Profesor Julian Vane',
    role: 'Rector Emérito de la Academia San Judas',
    floor: 1,
    room: 'Despacho Rectoral',
    avatarColor: '#7c3aed',
    avatarIcon: 'graduation-cap',
    bio: 'Historiador obsesivo que custodia los archivos fundacionales del distrito.',
    alibi: 'Estudiaba genealogías victorianas en el archivo.',
    motive: 'La fundación Armstrong amenazaba con recortar los fondos de la academia.',
    suspicionLevel: 45,
    interrogated: false,
    contradictionExposed: false,
    notes: [
      'Conoce el túnel secreto que conecta la escuela con las calderas del edificio.',
      'Tiene en su poder el testamento original sellado.'
    ]
  }
];

// Pedestrian Dialogues
export const PEDESTRIAN_DIALOGUES: Record<string, DialogueNode> = {
  'ped_tommy_dialogue': {
    id: 'ped_tommy_dialogue',
    speaker: 'Tommy "El Canillita"',
    text: '¡Edición nocturna! ¡Crimen en la alta sociedad! Oiga detective, si busca pistas frescas, vi a un tipo con impermeable negro cruzar la calle a toda prisa hacia la Librería hace unos minutos.',
    mood: 'smug',
    choices: [
      { text: '¿Viste hacia dónde se dirigió exactamente?', nextDialogueId: 'tommy_pista1' },
      { text: '¿Qué se dice del Edificio Armstrong?', nextDialogueId: 'tommy_pista2' },
      { text: 'Gracias, muchacho. Mantén los ojos abiertos.', nextDialogueId: 'exit' }
    ]
  },
  'tommy_pista1': {
    id: 'tommy_pista1',
    speaker: 'Tommy "El Canillita"',
    text: 'Entró por la puerta trasera de la Librería El Cuervo. El librero Crowley le abrió de inmediato con cara de pánico. Algo turbio se cuece entre esos libros viejos.',
    choices: [
      { text: 'Iré a investigar la Librería.', nextDialogueId: 'exit' }
    ]
  },
  'tommy_pista2': {
    id: 'tommy_pista2',
    speaker: 'Tommy "El Canillita"',
    text: 'Todo el mundo sabe que el viejo Armstrong tenía enemigos hasta debajo de las baldosas. La cantante del cabaret y el médico vivían peleando con él.',
    choices: [
      { text: 'Volveré a patrullar la calle.', nextDialogueId: 'exit' }
    ]
  },

  'ped_clara_dialogue': {
    id: 'ped_clara_dialogue',
    speaker: 'Clara "La Dama del Paraguas"',
    text: 'Buenas noches, detective. Una noche peligrosa para andar desarmado en la niebla. El Hospital Santa Elena huele a éter más de lo normal hoy.',
    mood: 'neutral',
    choices: [
      { text: '¿Notó algún movimiento inusual cerca del Hospital?', nextDialogueId: 'clara_hospital' },
      { text: '¿Conoce a los vecinos del Edificio Armstrong?', nextDialogueId: 'clara_vecinos' },
      { text: 'Tenga cuidado, señorita.', nextDialogueId: 'exit' }
    ]
  },
  'clara_hospital': {
    id: 'clara_hospital',
    speaker: 'Clara "La Dama del Paraguas"',
    text: 'Una ambulancia llegó con las luces apagadas cerca de las 11:15 PM. Vi a la enfermera Beatrice recibir un maletín de manos de un hombre con cicatriz.',
    choices: [
      { text: 'La morgue guarda muchos secretos esta noche.', nextDialogueId: 'exit' }
    ]
  },
  'clara_vecinos': {
    id: 'clara_vecinos',
    speaker: 'Clara "La Dama del Paraguas"',
    text: 'Madame Vivienne cantaba en el cabaret hasta que se enamoró del hombre equivocado. Ella es apasionada, pero no tiene corazón de asesina.',
    choices: [
      { text: 'Interesante observación.', nextDialogueId: 'exit' }
    ]
  },

  'ped_morales_dialogue': {
    id: 'ped_morales_dialogue',
    speaker: 'Agente Morales',
    text: 'Detective Vance, tenemos el perímetro de las cuatro cuadras asegurado. Ni una rata sale de este distrito sin que lo sepamos. ¿Cómo va el caso principal?',
    mood: 'neutral',
    choices: [
      { text: '¿Han revisado la Academia San Judas?', nextDialogueId: 'morales_escuela' },
      { text: 'Cierre los accesos al puerto hasta nuevo aviso.', nextDialogueId: 'morales_puerto' },
      { text: 'Siga vigilando la calle, agente.', nextDialogueId: 'exit' }
    ]
  },
  'morales_escuela': {
    id: 'morales_escuela',
    speaker: 'Agente Morales',
    text: 'El rector Vane dice que la escuela está cerrada, pero vimos una linterna encendida en los sótanos hace media hora.',
    choices: [
      { text: 'Iré a inspeccionar la Academia.', nextDialogueId: 'exit' }
    ]
  },
  'morales_puerto': {
    id: 'morales_puerto',
    speaker: 'Agente Morales',
    text: 'Entendido. Si el sospechoso intenta escapar hacia los barcos, lo interceptaremos en el muelle 4.',
    choices: [
      { text: 'Buen trabajo, Morales.', nextDialogueId: 'exit' }
    ]
  },

  'ped_sam_dialogue': {
    id: 'ped_sam_dialogue',
    speaker: 'Viejo Sam',
    text: 'Pst... sabueso. En los charcos brillan cosas que los ricos tiran cuando huyen con prisa. ¿Tiene una moneda para un trago de café caliente?',
    mood: 'nervous',
    choices: [
      { text: '¿Qué encontraste en los callejones, Sam?', nextDialogueId: 'sam_pista' },
      { text: '¿Viste a alguien saltar desde las escaleras de incendios?', nextDialogueId: 'sam_fuga' },
      { text: 'Ten cuidado con la lluvia, Sam.', nextDialogueId: 'exit' }
    ]
  },
  'sam_pista': {
    id: 'sam_pista',
    speaker: 'Viejo Sam',
    text: 'Alguien arrojó una ganzúa y un guante de cuero empapado en el contenedor de basura entre la Librería y la Escuela. Eran huellas de suela militar.',
    choices: [
      { text: 'Vincent Navarro usa ese tipo de calzado.', nextDialogueId: 'exit' }
    ]
  },
  'sam_fuga': {
    id: 'sam_fuga',
    speaker: 'Viejo Sam',
    text: 'Desde el ático del edificio Armstrong vi a un sujeto asomarse a la cornisa. Tenía una cuerda preparada. Si no lo detiene pronto, saltará hacia los cables del tranvía.',
    choices: [
      { text: 'Debo apresurarme a atraparlo.', nextDialogueId: 'exit' }
    ]
  },

  // Bookstore Crowley dialogue
  'crowley_start': {
    id: 'crowley_start',
    speaker: 'Gideon Crowley',
    text: 'Bienvenido a "El Cuervo y la Llave", detective. Disculpe el desorden, estaba revisando unos incunables del siglo XVI. ¿Qué asunto policial lo trae a mi santuario de papel?',
    mood: 'smug',
    choices: [
      { text: 'Reconozca este manuscrito con hojas arrancadas.', nextDialogueId: 'crowley_manuscrito', requiredClueId: 'codice_antiguo' },
      { text: '¿Le vendió una máquina de escribir a Vincent Navarro?', nextDialogueId: 'crowley_maquina' },
      { text: 'Encontré esta factura a nombre de Armstrong en su caja.', nextDialogueId: 'crowley_factura', requiredClueId: 'recibo_compra' },
      { text: 'Regresaré a inspeccionar las estanterías.', nextDialogueId: 'exit' }
    ]
  },
  'crowley_manuscrito': {
    id: 'crowley_manuscrito',
    speaker: 'Gideon Crowley',
    text: '¡Por favor, manipúlelo con guantes! Ese volumen describe la alquimia del cianuro de almendra. Alguien me lo encargó bajo anonimato y luego pagó el doble por arrancar las recetas letales.',
    mood: 'terrified',
    choices: [
      { text: '¿Quién fue el comprador?', nextDialogueId: 'crowley_comprador' }
    ]
  },
  'crowley_comprador': {
    id: 'crowley_comprador',
    speaker: 'Gideon Crowley',
    text: 'Un hombre de voz ronca que vestía abrigo oscuro y usaba la contraseña "París 1947". ¡Es el mismo del ático del edificio!',
    choices: [
      { text: 'Vincent Navarro sin duda.', nextDialogueId: 'crowley_start' }
    ]
  },
  'crowley_maquina': {
    id: 'crowley_maquina',
    speaker: 'Gideon Crowley',
    text: 'Sí, una vieja Remington con la tecla "e" atascada. Me dio 50 dólares en efectivo y no pidió recibo.',
    choices: [
      { text: 'Coincide exactamente con la nota de chantaje.', nextDialogueId: 'crowley_start' }
    ]
  },
  'crowley_factura': {
    id: 'crowley_factura',
    speaker: 'Gideon Crowley',
    text: '¡Arthur Armstrong me extorsionaba con falsas deudas! Yo no lo maté, pero admito que el mundo respira mejor sin él.',
    choices: [
      { text: 'Lo tendré en cuenta para el informe.', nextDialogueId: 'crowley_start' }
    ]
  },

  // Hospital Beatrice dialogue
  'beatrice_start': {
    id: 'beatrice_start',
    speaker: 'Enfermera Beatrice',
    text: 'Detective Vance, la morgue no es lugar para visitas casuales. Lord Armstrong falleció de un colapso cardíaco según el primer vistazo, ¿o acaso sospecha de algo más?',
    mood: 'neutral',
    choices: [
      { text: 'Lord Armstrong fue envenenado con cianuro y amapola.', nextDialogueId: 'beatrice_veneno' },
      { text: 'Explique este expediente de cambio facial en su mesa.', nextDialogueId: 'beatrice_expediente', requiredClueId: 'informe_autopsia' },
      { text: 'Encontré un bisturí con restos de lacre y seda.', nextDialogueId: 'beatrice_bisturi', requiredClueId: 'bisturi_manchado' },
      { text: 'Continuaré revisando las fichas médicas.', nextDialogueId: 'exit' }
    ]
  },
  'beatrice_veneno': {
    id: 'beatrice_veneno',
    speaker: 'Enfermera Beatrice',
    text: 'El Dr. Thorne tiene acceso exclusivo a esas fórmulas. Si me pregunta a mí, ese médico ya no tenía pulso para recetar calmantes.',
    choices: [
      { text: '¿Y qué hacía Vincent Navarro en la clínica hoy?', nextDialogueId: 'beatrice_vincent' }
    ]
  },
  'beatrice_vincent': {
    id: 'beatrice_vincent',
    speaker: 'Enfermera Beatrice',
    text: 'Vino a retirar un certificado de defunción en blanco con sellos oficiales... pagó una fortuna por él. Me amenazó con arruinar mi carrera si hablaba.',
    mood: 'terrified',
    choices: [
      { text: 'Planeaba fingir su propia muerte o la de otro.', nextDialogueId: 'beatrice_start' }
    ]
  },
  'beatrice_expediente': {
    id: 'beatrice_expediente',
    speaker: 'Enfermera Beatrice',
    text: 'Ese expediente... pertenecía a un cirujano plástico que desapareció misteriosamente el mes pasado. Iban a operar a un fugitivo.',
    choices: [
      { text: 'Todas las pistas apuntan a una red de corrupción.', nextDialogueId: 'beatrice_start' }
    ]
  },
  'beatrice_bisturi': {
    id: 'beatrice_bisturi',
    speaker: 'Enfermera Beatrice',
    text: 'Ese bisturí desapareció de la bandeja de esterilización esta tarde. Quien lo robó lo usó para forzar cerraduras sin hacer ruido.',
    choices: [
      { text: 'Con esto cortaron el vestido de Vivienne.', nextDialogueId: 'beatrice_start' }
    ]
  },

  // School Vane dialogue
  'vane_start': {
    id: 'vane_start',
    speaker: 'Profesor Julian Vane',
    text: 'Buenas noches, detective. La Academia San Judas ha educado a las mentes más brillantes de esta ciudad. Si viene por los rumores sobre Lord Armstrong, lamento informarle que la soberbia siempre precede a la caída.',
    mood: 'neutral',
    choices: [
      { text: 'Sé de la existencia del túnel secreto entre la academia y el edificio.', nextDialogueId: 'vane_tunel', requiredClueId: 'plano_tuneles' },
      { text: '¿Dónde está la copia original del testamento de Armstrong?', nextDialogueId: 'vane_testamento' },
      { text: 'Explique esta llave de la cripta rectoral.', nextDialogueId: 'vane_llave', requiredClueId: 'llave_boveda_rector' },
      { text: 'Examinaré la biblioteca de la escuela.', nextDialogueId: 'exit' }
    ]
  },
  'vane_tunel': {
    id: 'vane_tunel',
    speaker: 'Profesor Julian Vane',
    text: '¡Ese túnel fue construido durante la ley seca para transportar carbón y barriles! Pero alguien abrió los cerrojos de hierro hace dos noches... Alguien pudo entrar y salir del edificio sin pisar la calle.',
    mood: 'nervous',
    choices: [
      { text: 'Eso explica cómo el asesino burló la vigilancia policial de la entrada.', nextDialogueId: 'vane_start' }
    ]
  },
  'vane_testamento': {
    id: 'vane_testamento',
    speaker: 'Profesor Julian Vane',
    text: 'Arthur Armstrong me confió el testamento hace un año: dejaba toda su fortuna a la beneficencia y al orfanato municipal, desheredando a sus compinches y socios criminales. Por eso lo querían muerto.',
    choices: [
      { text: 'Vincent Navarro fue contratado para destruirlo.', nextDialogueId: 'vane_start' }
    ]
  },
  'vane_llave': {
    id: 'vane_llave',
    speaker: 'Profesor Julian Vane',
    text: 'Con esa llave puede abrir la caja de hierro del altar. El documento sellado está a salvo allí. Si lo lleva al juez, la verdad prevalecerá.',
    choices: [
      { text: 'Lo aseguraré de inmediato.', nextDialogueId: 'vane_start' }
    ]
  }
};
