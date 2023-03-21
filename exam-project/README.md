# Til sensor - Eksamensprosjekt DAT310 vår 2021: Stølsbooking

Hei, velkommen til min eksamensbesvarelse i faget DAT310 ved Universitetet i Stavanger, tatt våren 2021. Tema for denne oppgaven var booking av små hytter (støler) i indre Gjesdal. Prosjektet er inspirert av en friluftsforening jeg selv er medlem i, "Foreningen for stølsliv og friluftsliv i indre Gjesdal". Per i dag har den kun et par støler som kan leies ut, men det er tatt med noen ekstra for testingens skyld.

## Installasjon og oppsett

Applikasjonen kjører Vue (Javascript) frontend og Flask (Python) backend. Den er testet med Python-versjon nyere enn eller lik 3.7.7, i nettleseren Firefox 87, i både macOS og på Windows 10. Merk at applikasjonen krever internettilgang, da javascriptbibliotek som Vue og Bootstrap blir hentet fra CDN.

Eksempel på installasjonsprosedyre.

1. Sørg for at Python er installert.
2. Lag et nytt virtuelt miljø med kommandoen `python -m venv /path/til/nytt/venv`.
3. Aktiver det virtuelle miljøet du nettopp opprettet.
4. Installer Flask og PIL med `pip install flask pillow`.
5. Test applikasjonen med `python app.py`. 
   - Merk at dette lager en ny database, hvis det ikke allerede finnes en; du kan tilbakestille databasen ved å slette den og kjøre programmet på nytt.
6. Nå er du klar til å bruke applikasjonen. Naviger til adressen `localhost:5000` i nettleseren.

## Funksjonalitet

### Funksjonskrav fra oppgavetekst
#### SPA og REST API
- Applikasjonen er en SPA implementert i Vue som kommuniserer med en Flask-server via AJAX-kall.
- Applikasjonen bruker Vue-Router.
- Applikasjonsfiler sendes som statiske filer (fra mappa `static`) og data eksponeres gjennom et REST API.
- Applikasjonen er fordelt i komponenter. De komponenter som kun brukes i en annen komponent kan være lagt til som lokale subkomponenter, for ikke å forurense namespace og minimere antall GET-forespørsler.
#### Login
- Pålogging og registrering gjøres gjennom komponenten `loginpageC`. Alle brukere lagres i databasen.
- Det finnes to brukertyper: administrator (admin) og "vanlig" (eller ikke-admin).
- Den siste administratoren kan ikke slettes.
- Passord kan endres av administrator, og må være minst 8 tegn langt.
- Se testbrukere under Dataobjekttyper > Brukere lenger nede.
#### Dataobjekter
- Databasen inneholder fire tabeller/dataobjekttyper utenom brukere: `cabins`, `reservations`, `products` og `inventory` (tabellnavn). 
- Disse eksponeres gjennom REST API. Ubrukte REST-kalltyper er fjernet jamfør forbud mot ubrukt kode i innlevering.
- Tilgangskontroll (spesifikk autentisering påkrevd) for flere av operasjonene.
#### Datafremvisning
- Gruppen av hytte-dataelementer som vises kan velges gjennom komponenten `cabinfiltersC` som er tilgjengelig gjennom "Hytteoversikt" eller "Min side".
- Det er mulig å filtrere og sortere data.
- Visningen kan endres gjennom å velge dette øverst i `cabinfiltersC` (kan velge mellom infokort, liste eller trekkspill-liste.
- Filter lagres kontinuerlig (etter 1000 millisekunds opphold i inntastning, for å forhindre en PUT-forespørsel for hvert tastetrykk).
- Lagres i bruker-objektet (hvis bruker er logget inn, finnes et `$root.loggedInUser`-objekt i nettopp roten til Vue-appen. Etter hvert som filtre endres blir dette lastet opp til databasen, slik at filtrene kan samkjøres mellom flere enheter. Admin har tilgang til å tilbakestille andres filtre.
#### Validering
- Skjemaer valideres i backend og frontend etter hva gir mening.
- Backend returnerer statuskoder, som blir oversatt til meningsfulle beskjeder vist til brukeren i form av statusvarsler/"alertmessage" (se "annen funksjonalitet").
#### Oppsett og layout
- Oppsettet er flytende/fluid og justerer til forskjellige størrelser.
- Siden Bootstrap er tatt i bruk fungerer applikasjonen også utmerket på mobilskjermer.
- Oppsettet har bakgrunnsbilde på indekssiden ("/") og bilder for hytter vises også frem hvor dette er høvelig.
### Mer komplekse funksjoner
- Håndtering av datoer
  - Laget egen kalender-komponent (`calendarC`). Fungerer også som datovelger.
  - Håndtering på frontend og backend (regne ut om datoer overlapper, om dato er valgt, osv.). Håndterer tidssoner og lagrer datoer i database som ISO8601-streng.
- Håndtering av bilder
  - Støtter bildeopplasting. 
  - Gjør PNG til JPEG og komprimerer opplastede bilder ved å sette litt lavere kvalitet.
- Håndtering av geografisk posisjon.
  - Lagrer posisjon til hytte som koordinater.
  - Regner ut avstand fra bruker til hytte i `homeC`.
  - Støtter filtrering og sortering basert på avstand.
  - Hvis applikasjonen henter posisjon, vises også avstanden til hver av hyttene i `homeC`.
  - Parsing av koordinater på frontend.
  - Auto-genererte lenker til norgeskart.no og veibeskrivelse gjennom Google Maps (`cabininfoC`)
- Auomatisk generering av tilfeldig database-data i opppsettet.
  - Et tilfeldig antall reservasjoner legges inn når databasen genereres.
  - Et tilfeldig antall produkter tillegges hver av hyttenes lagerbeholdning. 
- Tilleggsprodukter/proviant til reservasjon
  - Inspirert av systemet på Turistforeningens hytter, kan man også her bestille ekstra proviant.
- Administatorside
  - Lar administator endre å alle data i nettsiden, og er designet for at en bruker uten IT-kunnskaper skal kunne utføre alle applikasjonsadministrative oppgaver.
### Annen funksjonalitet
- Laget egen komponent for statusvarsler (`alertmessageC`). 
  - Denne kan generere en Bootstrap-alert basert på et objekt med `type` og `text`.
  - Lagt til alert messages hvor dette gir mening.
- I tabeller over reservasjoner vises grønn bakgrunn hvis reservasjonen både bekreftelse og betaling er registert (av administator).
- I tabeller over reservasjoner vises grå bakgrunn for reservasjoner hvis sluttdato er forbi (gamle reservasjoner).
- Når reservasjoner godkjennes av administator, trekkes automatisk tilsvarende antall produkter fra hyttens inventar/lagerbeholdning.
- "I'm feeling lucky" i navbar velger en tilfeldig hytte. Denne var opprinnelig laget i testing-øyemed, men jeg valgte å la den bli værende, siden ennå har sine brukstilfeller. En referanse til Googles "I'm feeling lucky"-knapp.
- Bevisst valg: Brukere *har* lov å reservere i fortiden. Dette er gjort slik at hvis noen overnatter på en hytte uten å registrere dette på forhånd, kan det etterregistreres.
- "Reserver"-knapp vises i tillegg til "Mer info" i `homeC` hvis brukeren er logget inn. Forskjellen er at den førstnevnte også skroller deg ned til hvor man skal taste inn reservasjon.
- Oversikt over brukers reservasjoner i `myreservationsC`.
- "Min side" hvor brukeren kan redigere egen bruker og egne visningsfiltre.
- Utlogging sender brukeren tilbake til indekssiden.
- Ikke-innloggede brukere kan ikke se/sende reservasjoner.
- Statusvarsler / "alert messages":
  - Feilmelding vises f.eks. hvis et REST-kall returnerer statuskode 4xx.
  - Suksessmelding vises f.eks. når et REST-kall returnerer statuskode 2xx.
  - Advarsel vises f.eks. hvis data er motstridende, hvis en ID ikke eksisterer, passord ikke stemmer overens eller ikke tilfredsstiller krav.
  - Infomelding vises f.eks. når det det ikke er valgt noe i input, eller når det ikke er noen data å vise (tomt array e.l.).
  - Alertmessage kan enten være statisk melding (f.eks. `<alertmessage v-if="condition" :alert-message="{type:'alert-warning', text:'Advarsel: [...]'}"></alertmessage>`)
  - Eller alertmessage kan vises dynamisk (f.eks. `<alertmessage v-if="alertObject" :alert-message="alertObject"></alertmessage>`). Denne er lett å gjenbruke.
- Administratorside
  - Kan vise liste over alle brukere
  - Kan legge til, redigere og slette brukere; tilbakestille brukers visningsfiltre og gjøre administrator.
  - Kan legge til og slette hytter
  - Kan vise reservasjoner per bruker og per hytte, legge til, godkjenne og slette reservasjoner.
  - Kan vise lagerbeholdning (produkter og antall) på hytte; se, slette og legge til produkttyper, 
- Når man sletter et dataobjekt, slettes også de dataobjekter som referer til dette.
  - For eksempel, når man sletter en hytte, slettes også reservasjoner og lagerbeholdninger knyttet til hytten.
- Når man godkjenner *alle* reservasjoner på likt, telles først opp alle produkter som vil bli trukket fra hyttene. Hvis det ikke er nok produkter til å godkjenne alle reservasjoner, blir ikke forespørselen gjennomført (ingen reservasjoner godkjennes).

## Dataobjekttyper
### Brukere
- Har primary key id
- Default brukerinnlogging:
  1. Jonas Emanuel Gilje (admin)
     - Brukernavn: 1jonasgilje@gmail.com
     - Passord: Jonas123
  2. Ola Nordmann
     - Brukernavn: ola@nordmann.no
     - Passord: OlaErBest
  3. Kari Nordmann   
     - Brukernavn: kari@nordmann.no
     - Passord: KariKari
### Hytter
- Har primary key id
### Reservasjoner
- Har primary key id
- Foreign keys reservedBy (refererer til bruker-ID) og cabinId (refererer til hytte-ID).
### Produkttype
- Har primary key id
### Lagerbeholdning
- Foreign keys cabinId (refererer til hytte-ID) og productId (refererer til produkttype-ID).
- Tuppelet (cabinId, productId) utgjør primary key.

## Oversikt over Vue-komponenter (i `/static/components`)
Vue-komponenter er avhengige av hverandre. Dette er en oversikt over hvordan de avhenger av hverandre. På den måten får man en oversikt over gjenbruk av komponenter, samt hvordan applikasjonen høvelig er delt inn i komponenter og subkomponenter.
### adminpageC
- Subkomponenter
  - manageusers
    - bruker loginpageC 
    - bruker alertmessageC
  - managecabins
    - bruker alertmessageC
  - managereservations
    - bruker reservationstableC
    - bruker alertmessageC
    - subkomponent cabinreservationstable
    - bruker cabininfoinputsC
  - manageproducts 
    - bruker alertmessageC
### alertmessageC
### cabincardC
- Brukes i homeC sin infokortvisning.
### cabinfiltersC
- Filtrerer hytter.
- subkomponent load-user-filters
  - Gjør at filtre oppdateres hvis det er en innlogget bruker.
### cabininfoC
- bruker cabininfoinputsC
- bruker reservationstableC
- bruker alertmessageC
### cabininfoinputsC
- Brukes til å sende inn reservasjoner.
- bruker alertmessageC
### calendarC
- Brukes til å fremvise og velge datoer.
### homeC
- Subkomponenter
  - listview
    - Lager listevisning
  - accordionview
    - Lager trekkspill-listevisning 
- bruker cabinfiltersC
- bruker cabincardC
- bruker alertmessageC
### indexpageC
### loginpageC
- bruker alertmessageC
### mypageC
- bruker loginpageC
- bruker cabinfiltersC
### myreservationsC
- bruker reservationstableC
### navbarC
### reservationstableC
- bruker alertmessageC

## Kilder
### Hentet fra nettet: formel for å finne overlappende dato-perioder
kilde: https://stackoverflow.com/questions/325933/determine-whether-two-date-ranges-overlap
### Hentet fra nettet: formel for avstand mellom to sfæriske koordinater
kilde: http://edwilliams.org/avform147.htm








