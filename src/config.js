// All personal details live here. Text is shown exactly as written.
// Dates use ISO format with the India offset (+05:30); the date lines are generated from them.

export const config = {
  bride: { name: 'Fareeda Nazreen' },
  groom: { name: 'Muhammed Jasin' },
  timeZone: 'Asia/Kolkata',

  invitation: {
    // Arabic Quranic verse displayed at the top of the invitation
    ayah: 'بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ',
    bismillahMeaning: 'In the name of Allah, the Most Beneficent and Merciful',
    blessingsIntro: 'You are cordially invited to the wedding ceremony of',
    // Used on the reception invitation names page instead of blessingsIntro
    blessingsIntroReception: 'We cordially invite you to grace the wedding ceremony of',
    blessings: '',
    hosts: '',
    hostsLine: '',
    joiner: '&',
    joinerReception: 'AND',
    // Bride's family details (shown below bride's name); use \n for line breaks
    brideDetails: 'D/O Muhammed TP,\nSubaida MH (Thandiyeckal)',
    brideDetailsReception: 'D/O Muhammed & Subaida\n(Thandiyekkal House, Engapuzha)',
    // Groom's family details (shown below groom's name); use \n for line breaks
    groomParents: 'S/O Kunhassan\n& Sajitha (Jas Villa)',
    groomParentsReception: 'S/O Kunhassan & Sajitha\n(Jas Villa, Ollur)',
  },

  nikah: {
    eyebrow: 'InshaAllah on',
    title: 'Nikah',
    subtitle: '',
    start: '2026-11-28T11:00:00+05:30',
    dayText: 'On Saturday',
    hijri: '',
    timeText: 'at 11:00 AM',
    venuePrefix: 'At',
    venue: 'ST GEORGE Programme Hall',
    address: ['Puduppady'],
    // Paste the exact Google Maps share link in `url` (or fill lat/lng) to pin the venue precisely.
    map: { url: '', lat: null, lng: null, query: 'ST GEORGE Programme Hall, Puduppady' },
  },

  reception: {
    eyebrow: '',
    title: 'Reception',
    subtitle: '',
    start: '2026-11-29T15:30:00+05:30',
    dayText: 'On Sunday',
    hijri: '',
    timeText: 'from 3:30 PM',
    venuePrefix: 'At',
    venue: 'Jas Villa',
    address: ['Ollur'],
    map: { url: '', lat: null, lng: null, query: 'Jas Villa, Ollur' },
  },

  // Closing page sign-off — Nikkah invitation
  families: 'Fathima Noureen,\nAjmal Hakeem',
  // Closing page sign-off — Reception invitation
  familiesReception: 'Salman,\nJasna Hassan and Relatives',

  // Put the song in /public/music/ and set e.g. src: '/music/song.mp3'. Empty = no music button.
  music: { src: '/music/song.mp3', volume: 0.6, startAt: 0 },

  text: {
    sealHint: 'Tap to open',
    revealTitle: 'Tap to Reveal',
    revealedTitle: 'Save the Date',
    inshallah: 'Inshallah',
    countdownTitle: 'Counting down to the big day',
    countdownDone: 'Today is the day \u2014 Alhamdulillah',
    closingKicker: '',
    closing: 'Your presence will make our day special.',
    closingReception: 'We would be delighted to have your presence and blessings on this joyous occasion.',
    compliments: 'Best regards',
    complimentsReception: 'Best Regards,',
  },

  // Public address after deploying (used for share previews), e.g. 'https://example.vercel.app'.
  siteUrl: 'https://jasin-fareeda-invitation.vercel.app',
};
