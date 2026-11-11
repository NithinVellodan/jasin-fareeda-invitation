// All personal details live here. Text is shown exactly as written.
// Dates use ISO format with the India offset (+05:30); the date lines are generated from them.

export const config = {
  groom: {
    name: 'Muhammed Jasin',
    shortName: 'Jasin',
    parents: 'Kunhassan & Sajitha',
    residence: '(Jas villa, Ollur)',
  },
  bride: {
    name: 'Fareeda Nazreen',
    shortName: 'Fareeda',
    parents: 'Muhammed TP & Subaida MH',
    residence: '(Thandiyeckal House, Engapuzha)',
  },
  timeZone: 'Asia/Kolkata',

  contact: {
    location: 'Ollur',
    phone: '+91 90378 75676',
    phoneRaw: '+919037875676',
  },

  invitation: {
    bismillahAr: '&#xFDFD;',
    bismillahMeaning: 'In the name of Allah, the Most Beneficent and Merciful',
    hostsLine: 'You are cordially invited to the wedding ceremony & celebration of',
    joiner: '&',
    inshaAllah: 'Insha Allah',
    presenceText: 'We would be delighted to have your presence and blessings on these joyous occasions.',
  },

  nikah: {
    eyebrow: 'The Sacred Union',
    title: 'Nikah Ceremony',
    subtitle: 'Wedding',
    // 28th November 2026 at 11:30 AM
    start: '2026-11-28T11:30:00+05:30',
    dayText: 'Saturday, 28th November 2026',
    hijri: '',
    timeText: '11:30 AM',
    venuePrefix: 'At',
    venue: 'ST GEORGE Programme Hall',
    address: ['Puduppady, Kozhikode', 'Kerala'],
    qrImage: '/images/qr-nikah.png',
    map: {
      url: 'https://maps.app.goo.gl/XvmNT8G9gEWa1UCt9?g_st=iw',
      lat: null,
      lng: null,
      query: 'ST GEORGE programme hall, Puduppady',
    },
    regards: 'Fathima noureen, Ajmal Hakeem',
  },

  reception: {
    eyebrow: 'Joyous Celebration',
    title: 'Wedding Reception',
    subtitle: 'Feast & Blessings',
    // 29th November 2026 from 3:30 PM onwards
    start: '2026-11-29T15:30:00+05:30',
    dayText: 'Sunday, 29th November 2026',
    hijri: '',
    timeText: '3:30 PM onwards',
    venuePrefix: 'At',
    venue: 'Jas Villa',
    address: ['Ollur, Calicut', 'Kerala'],
    qrImage: '/images/qr-reception.png',
    map: {
      url: 'https://maps.app.goo.gl/brkpfbXBxuCLhhFf7?g_st=iw',
      lat: null,
      lng: null,
      query: 'Jas Villa, Ollur, Calicut',
    },
    regards: 'Salman, Jasna hassan and Relatives',
  },

  families: 'Salman, Jasna hassan, Fathima noureen, Ajmal Hakeem & Relatives',

  // Put the song in /public/music/ and set e.g. src: '/music/song.mp3'. Empty = no music button.
  music: { src: '/music/song.mp3', volume: 0.6, startAt: 0 },

  text: {
    sealHint: 'Tap to open',
    revealTitle: 'Tap to Reveal',
    revealedTitle: 'Save the Dates',
    inshallah: 'Insha Allah',
    countdownTitle: 'Counting down to the Nikah Ceremony',
    countdownDone: 'Today is the big day \u2014 Alhamdulillah',
    closingKicker: 'With warm regards & duas',
    closing: '“Your presence will make our day special.”',
    compliments: 'Best Regards,',
  },

  siteUrl: '',
};
