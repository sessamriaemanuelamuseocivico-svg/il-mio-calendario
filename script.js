/* ========================================
   CONFIGURAZIONE CALENDARIO
======================================== */

const STORAGE_KEY = "calendario_eventi";

const ORE_TOTALI_PROGETTO =
    1440 * 60;

const ORE_INIZIALI_COMPLETATE =
    (423 * 60) + 1;


/* ========================================
   PERIODO CALENDARIO
======================================== */

const dataInizio =
    new Date(2026, 8, 28);

const dataFine =
    new Date(2027, 0, 31);


/* ========================================
   NOMI MESI
======================================== */

const nomiMesi = [
    "Gennaio",
    "Febbraio",
    "Marzo",
    "Aprile",
    "Maggio",
    "Giugno",
    "Luglio",
    "Agosto",
    "Settembre",
    "Ottobre",
    "Novembre",
    "Dicembre"
];


/* ========================================
   NOMI GIORNI
======================================== */

const nomiGiorni = [
    "Lun",
    "Mar",
    "Mer",
    "Gio",
    "Ven",
    "Sab",
    "Dom"
];


/* ========================================
   EVENTI
======================================== */

let eventi = [];


/* ========================================
   RIFERIMENTI HTML
======================================== */

const calendario =
    document.getElementById("calendar");

const calendarView =
    document.getElementById("calendar-view");

const dayView =
    document.getElementById("day-view");

const selectedDate =
    document.getElementById("selected-date");

const hoursContainer =
    document.getElementById("hours");


/* ========================================
   FORM EVENTO
======================================== */

const eventFormContainer =
    document.getElementById(
        "event-form-container"
    );

const eventForm =
    document.getElementById(
        "event-form"
    );

const formTitle =
    document.getElementById(
        "form-title"
    );

const eventTitle =
    document.getElementById(
        "event-title"
    );

const eventStart =
    document.getElementById(
        "event-start"
    );

const eventEnd =
    document.getElementById(
        "event-end"
    );

const eventNotes =
    document.getElementById(
        "event-notes"
    );

const deleteEventButton =
    document.getElementById(
        "delete-event"
    );

const cancelEventButton =
    document.getElementById(
        "cancel-event"
    );


/* ========================================
   RIEPILOGO
======================================== */

const eventCount =
    document.getElementById(
        "event-count"
    );

const projectCompleted =
    document.getElementById(
        "project-completed"
    );

const projectRemaining =
    document.getElementById(
        "project-remaining"
    );

const dailyMuseumHours =
    document.getElementById(
        "daily-museum-hours"
    );

const weeklyMuseumHours =
    document.getElementById(
        "weekly-museum-hours"
    );


/* ========================================
   PULSANTE INDIETRO
======================================== */

const backButton =
    document.getElementById(
        "back-to-calendar"
    );

/* ========================================
   SUPABASE
======================================== */

const SUPABASE_URL =
    "https://crfqetioeampnhbljrac.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_fE5j2sPR_J-Rs71ZIKOurA_ZK6Bbk_N";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );

/* ========================================
   LOGIN
======================================== */

const loginScreen =
    document.getElementById("login-screen");

const loginForm =
    document.getElementById("login-form");

const loginEmail =
    document.getElementById("login-email");

const loginPassword =
    document.getElementById("login-password");

const loginError =
    document.getElementById("login-error");


loginForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        loginError.textContent = "";

        const email =
            loginEmail.value.trim();

        const password =
            loginPassword.value;

        const { error } =
            await supabaseClient.auth
                .signInWithPassword({
                    email: email,
                    password: password
                });

        if (error) {

            console.error(
                "Errore login:",
                error
            );

            loginError.textContent =
                "Email o password non corretti.";

            return;
        }

        loginScreen.classList.add(
            "hidden"
        );

        console.log(
            "Login effettuato correttamente."
        );

    }
);


/* ========================================
   CONVERTI EVENTO DA SUPABASE
======================================== */

function eventoDaDatabase(riga) {

    return {

        id: riga.id,

        data: riga.data,

        titolo: riga.titolo,

        inizio:
            riga.ora_inizio
                ? riga.ora_inizio.slice(0, 5)
                : "",

        fine:
            riga.ora_fine
                ? riga.ora_fine.slice(0, 5)
                : "",

        note:
            riga.note || ""

    };

}


/* ========================================
   STATO
======================================== */

let giornoSelezionato = null;

let eventoInModifica = null;


/* ========================================
   SUPABASE - CARICA EVENTI
======================================== */

async function caricaEventiDaSupabase() {

    const { data, error } =
        await supabaseClient
            .from("eventi")
            .select("*")
            .order("data")
            .order("ora_inizio");

    if (error) {

        console.error(
            "Errore caricamento Supabase:",
            error
        );

        throw error;

    }

    eventi =
        (data || []).map(
            eventoDaDatabase
        );

}


/* ========================================
   SUPABASE - CREA EVENTO
======================================== */

async function creaEventoSuSupabase(evento) {

    const { data, error } =
        await supabaseClient
            .from("eventi")
            .insert({

                titolo: evento.titolo,

                data: evento.data,

                ora_inizio: evento.inizio,

                ora_fine: evento.fine,

                note: evento.note || null

            })
            .select()
            .single();

    if (error) {

        console.error(
            "Errore creazione evento:",
            error
        );

        throw error;

    }

    return eventoDaDatabase(data);

}


/* ========================================
   SUPABASE - MODIFICA EVENTO
======================================== */

async function aggiornaEventoSuSupabase(evento) {

    const { error } =
        await supabaseClient
            .from("eventi")
            .update({

                titolo: evento.titolo,

                data: evento.data,

                ora_inizio: evento.inizio,

                ora_fine: evento.fine,

                note: evento.note || null

            })
            .eq("id", evento.id);

    if (error) {

        console.error(
            "Errore modifica evento:",
            error
        );

        throw error;

    }

}


/* ========================================
   SUPABASE - ELIMINA EVENTO
======================================== */

async function eliminaEventoSuSupabase(id) {

    const { error } =
        await supabaseClient
            .from("eventi")
            .delete()
            .eq("id", id);

    if (error) {

        console.error(
            "Errore eliminazione evento:",
            error
        );

        throw error;

    }

}


/* ========================================
   MIGRA EVENTI LOCALI → SUPABASE
======================================== */

async function migraEventiLocaliSeNecessario() {

    const { data: eventiOnline, error } =
        await supabaseClient
            .from("eventi")
            .select("*");

    if (error) {

        console.error(
            "Errore controllo eventi online:",
            error
        );

        throw error;

    }


    /* Se Supabase contiene già eventi,
       non facciamo nessuna migrazione. */

    if (
        eventiOnline &&
        eventiOnline.length > 0
    ) {

        return;

    }


    const eventiLocaliSalvati =
        localStorage.getItem(
            STORAGE_KEY
        );


    if (!eventiLocaliSalvati) {

        return;

    }


    let eventiLocali = [];

    try {

        eventiLocali =
            JSON.parse(
                eventiLocaliSalvati
            );

    } catch (errore) {

        console.error(
            "Errore lettura eventi locali:",
            errore
        );

        return;

    }


    if (
        !Array.isArray(eventiLocali) ||
        eventiLocali.length === 0
    ) {

        return;

    }


    const eventiDaInserire =
        eventiLocali.map(
            function (evento) {

                return {

                    titolo:
                        evento.titolo,

                    data:
                        evento.data,

                    ora_inizio:
                        evento.inizio,

                    ora_fine:
                        evento.fine,

                    note:
                        evento.note || null

                };

            }
        );


    const { error: erroreInserimento } =
        await supabaseClient
            .from("eventi")
            .insert(
                eventiDaInserire
            );

    if (erroreInserimento) {

        console.error(
            "Errore migrazione eventi:",
            erroreInserimento
        );

        throw erroreInserimento;

    }


    console.log(
        "Eventi locali trasferiti su Supabase."
    );

}

/* ========================================
   FORMATTA MINUTI
======================================== */

function formattaMinuti(minuti) {

    minuti = Math.max(
        0,
        Math.round(minuti)
    );


    const ore =
        Math.floor(minuti / 60);

    const minutiRimanenti =
        minuti % 60;


    return (
        ore +
        "h " +
        String(minutiRimanenti).padStart(
            2,
            "0"
        ) +
        "m"
    );

}


/* ========================================
   EVENTO MUSEO
======================================== */

function isEventoMuseo(evento) {

    if (
        !evento ||
        typeof evento.titolo !== "string"
    ) {

        return false;

    }


    return evento.titolo
        .toUpperCase()
        .includes("MUSEO");

}


/* ========================================
   CONVERTI ORARIO IN MINUTI
======================================== */

function orarioInMinuti(orario) {

    const parti =
        orario.split(":").map(Number);


    const ore = parti[0];

    const minuti = parti[1];


    return (
        (ore * 60) +
        minuti
    );

}


/* ========================================
   DURATA EVENTO
======================================== */

function durataEventoInMinuti(evento) {

    const inizio =
        orarioInMinuti(
            evento.inizio
        );

    const fine =
        orarioInMinuti(
            evento.fine
        );


    return fine - inizio;

}


/* ========================================
   AGGIORNA ORE SERVIZIO CIVILE
======================================== */

function aggiornaOreServizioCivile() {

    let minutiMuseo = 0;


    /*
       Sommiamo tutti gli eventi
       che contengono la parola MUSEO.
    */

    eventi.forEach(
        function (evento) {

            if (
                isEventoMuseo(evento)
            ) {

                const durata =
                    durataEventoInMinuti(
                        evento
                    );


                if (durata > 0) {

                    minutiMuseo += durata;

                }

            }

        }
    );


    /*
       Partiamo dalle 423h 01m iniziali.
    */

    const minutiCompletati =
        ORE_INIZIALI_COMPLETATE +
        minutiMuseo;


    /*
       Calcoliamo quanto rimane.
    */

    let minutiRimanenti =
        ORE_TOTALI_PROGETTO -
        minutiCompletati;


    if (
        minutiRimanenti < 0
    ) {

        minutiRimanenti = 0;

    }


    projectCompleted.textContent =
        formattaMinuti(
            minutiCompletati
        );


    projectRemaining.textContent =
        formattaMinuti(
            minutiRimanenti
        );


    aggiornaOreGiornaliere();

}


/* ========================================
   ORE MUSEO DEL GIORNO
======================================== */

function aggiornaOreGiornaliere() {

    if (!giornoSelezionato) {

        return;

    }


    const dataStringa =
        dataComeStringa(
            giornoSelezionato
        );


    let minutiTotali = 0;


    eventi.forEach(
        function (evento) {

            if (
                evento.data ===
                dataStringa &&
                isEventoMuseo(evento)
            ) {

                const durata =
                    durataEventoInMinuti(
                        evento
                    );


                if (durata > 0) {

                    minutiTotali += durata;

                }

            }

        }
    );


    dailyMuseumHours.textContent =
        formattaMinuti(
            minutiTotali
        );

}


/* ========================================
   INIZIO SETTIMANA
======================================== */

function inizioSettimana(data) {

    const risultato =
        new Date(data);


    const giorno =
        risultato.getDay();


    const differenza =
        giorno === 0
            ? -6
            : 1 - giorno;


    risultato.setDate(
        risultato.getDate() +
        differenza
    );


    risultato.setHours(
        0,
        0,
        0,
        0
    );


    return risultato;

}


/* ========================================
   ORE MUSEO SETTIMANALI
======================================== */

function aggiornaOreSettimanali() {

    if (!giornoSelezionato) {

        return;

    }


    const lunedi =
        inizioSettimana(
            giornoSelezionato
        );


    const domenica =
        new Date(lunedi);


    domenica.setDate(
        lunedi.getDate() + 7
    );


    let minutiTotali = 0;


    eventi.forEach(
        function (evento) {

            if (
                !isEventoMuseo(evento)
            ) {

                return;

            }


            const parti =
                evento.data
                    .split("-")
                    .map(Number);


            const dataEvento =
                new Date(
                    parti[0],
                    parti[1] - 1,
                    parti[2]
                );


            dataEvento.setHours(
                0,
                0,
                0,
                0
            );


            if (
                dataEvento >= lunedi &&
                dataEvento < domenica
            ) {

                const durata =
                    durataEventoInMinuti(
                        evento
                    );


                if (durata > 0) {

                    minutiTotali += durata;

                }

            }

        }
    );


    weeklyMuseumHours.textContent =
        formattaMinuti(
            minutiTotali
        );

}


/* ========================================
   CREA CALENDARIO
======================================== */

function creaCalendario() {

    calendario.innerHTML = "";


    let data =
        new Date(dataInizio);


    while (data <= dataFine) {

        const mese =
            document.createElement("section");


        mese.classList.add("mese");


        const titolo =
            document.createElement("h2");


        titolo.textContent =
            nomiMesi[data.getMonth()] +
            " " +
            data.getFullYear();


        mese.appendChild(titolo);


        /* Giorni settimana */

        const intestazione =
            document.createElement("div");


        intestazione.classList.add(
            "giorni-settimana"
        );


        for (
            let giorno of nomiGiorni
        ) {

            const elementoGiorno =
                document.createElement("div");


            elementoGiorno.textContent =
                giorno;


            intestazione.appendChild(
                elementoGiorno
            );

        }


        mese.appendChild(
            intestazione
        );


        /* Griglia */

        const giorni =
            document.createElement("div");


        giorni.classList.add("giorni");


        const primoGiorno =
            new Date(
                data.getFullYear(),
                data.getMonth(),
                1
            );


        let giornoSettimana =
            primoGiorno.getDay();


        if (
            giornoSettimana === 0
        ) {

            giornoSettimana = 6;

        } else {

            giornoSettimana--;

        }


        /* Spazi vuoti */

        for (
            let i = 0;
            i < giornoSettimana;
            i++
        ) {

            const spazio =
                document.createElement("div");


            spazio.classList.add(
                "giorno",
                "vuoto"
            );


            giorni.appendChild(
                spazio
            );

        }


        /* Giorni */

        const anno =
            data.getFullYear();


        const meseNumero =
            data.getMonth();


        const ultimoGiorno =
            new Date(
                anno,
                meseNumero + 1,
                0
            ).getDate();


        for (
            let numeroGiorno = 1;
            numeroGiorno <= ultimoGiorno;
            numeroGiorno++
        ) {

            const elementoGiorno =
                document.createElement("div");


            elementoGiorno.classList.add(
                "giorno"
            );


            const dataGiorno =
                new Date(
                    anno,
                    meseNumero,
                    numeroGiorno
                );


            if (
                dataGiorno >= dataInizio &&
                dataGiorno <= dataFine
            ) {

                elementoGiorno.classList.add(
                    "attivo"
                );


                elementoGiorno.textContent =
                    numeroGiorno;
                /* ====================================
   ANTEPRIMA EVENTI NEL CALENDARIO
==================================== */

const dataStringa =
    dataComeStringa(dataGiorno);

const eventiDelGiorno =
    eventi.filter(
        function (evento) {

            return (
                evento.data ===
                dataStringa
            );

        }
    );

if (eventiDelGiorno.length > 0) {

    const contenitoreEventi =
        document.createElement("div");

    contenitoreEventi.classList.add(
        "anteprima-eventi"
    );

    eventiDelGiorno.forEach(
        function (evento) {

            const anteprima =
                document.createElement("div");

            anteprima.classList.add(
                "anteprima-evento"
            );

            if (
                isEventoMuseo(evento)
            ) {

                anteprima.classList.add(
                    "anteprima-museo"
                );

            }

            anteprima.textContent =
                evento.inizio +
                " " +
                evento.titolo;

            anteprima.addEventListener(
                "click",
                function (event) {

                    event.stopPropagation();

                    apriGiorno(
                        dataGiorno
                    );

                }
            );

            contenitoreEventi.appendChild(
                anteprima
            );

        }
    );

    elementoGiorno.appendChild(
        contenitoreEventi
    );

}


                elementoGiorno.addEventListener(
                    "click",
                    function () {

                        apriGiorno(
                            dataGiorno
                        );

                    }
                );


            } else {

                elementoGiorno.classList.add(
                    "fuori-periodo"
                );


                elementoGiorno.textContent =
                    numeroGiorno;

            }


            giorni.appendChild(
                elementoGiorno
            );

        }


        mese.appendChild(
            giorni
        );


        calendario.appendChild(
            mese
        );


        data =
            new Date(
                data.getFullYear(),
                data.getMonth() + 1,
                1
            );

    }

}


/* ========================================
   APRI GIORNO
======================================== */

function apriGiorno(data) {

    giornoSelezionato =
        new Date(data);


    calendarView.classList.add(
        "hidden"
    );


    dayView.classList.remove(
        "hidden"
    );


    selectedDate.textContent =
        giornoSelezionato.getDate() +
        " " +
        nomiMesi[
            giornoSelezionato.getMonth()
        ] +
        " " +
        giornoSelezionato.getFullYear();


    creaOrari();

}


/* ========================================
   CREA TIMELINE
======================================== */

function creaOrari() {

    hoursContainer.innerHTML = "";


    /*
       La giornata mostrata va dalle
       07:00 alle 22:00.

       Ogni riga rappresenta 30 minuti.
    */

    const oraInizio =
        7 * 60;


    const oraFine =
        22 * 60;


    for (
        let minuti = oraInizio;
        minuti <= oraFine;
        minuti += 30
    ) {

        const riga =
            document.createElement("div");


        riga.classList.add(
            "hour-row"
        );


        /*
           Salviamo nel DOM il minuto
           corrispondente alla riga.
        */

        riga.dataset.minutes =
            minuti;


        const ora =
            Math.floor(
                minuti / 60
            );


        const minuto =
            minuti % 60;


        const oraFormattata =
            String(ora).padStart(
                2,
                "0"
            );


        const minutoFormattato =
            String(minuto).padStart(
                2,
                "0"
            );


        const etichetta =
            document.createElement("div");


        etichetta.classList.add(
            "hour-time"
        );


        etichetta.textContent =
            oraFormattata +
            ":" +
            minutoFormattato;


        const spazio =
            document.createElement("div");


        spazio.classList.add(
            "hour-slot"
        );


        spazio.dataset.minutes =
            minuti;


        spazio.addEventListener(
            "click",
            function () {

                /*
                   Quando clicchiamo sulla riga
                   creiamo un nuovo evento
                   partendo da quell'orario.
                */

                apriNuovoEvento(
                    oraFormattata +
                    ":" +
                    minutoFormattato
                );

            }
        );


        riga.appendChild(
            etichetta
        );


        riga.appendChild(
            spazio
        );


        hoursContainer.appendChild(
            riga
        );

    }


    mostraEventi();

}


/* ========================================
   NUOVO EVENTO
======================================== */

function apriNuovoEvento(ora) {

    eventoInModifica = null;


    formTitle.textContent =
        "Nuovo evento";


    deleteEventButton.classList.add(
        "hidden"
    );


    eventTitle.value = "";

    eventStart.value = ora;

    eventEnd.value = "";

    eventNotes.value = "";


    eventFormContainer.classList.remove(
        "hidden"
    );


    eventTitle.focus();

}


/* ========================================
   SALVA / MODIFICA EVENTO
======================================== */

eventForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const titolo =
            eventTitle.value.trim();


        const inizio =
            eventStart.value;


        const fine =
            eventEnd.value;


        const note =
            eventNotes.value.trim();


        /*
           Controllo orari.
        */

        if (
            !inizio ||
            !fine
        ) {

            return;

        }


        if (
            orarioInMinuti(fine) <=
            orarioInMinuti(inizio)
        ) {

            alert(
                "L'orario di fine deve essere successivo all'orario di inizio."
            );

            return;

        }


 /* ========================================
   MODIFICA EVENTO
======================================== */

if (
    eventoInModifica !== null
) {

    eventoInModifica.titolo =
        titolo;

    eventoInModifica.inizio =
        inizio;

    eventoInModifica.fine =
        fine;

    eventoInModifica.note =
        note;


    try {

        await aggiornaEventoSuSupabase(
            eventoInModifica
        );

    } catch (errore) {

        alert(
            "Errore nel salvataggio dell'evento."
        );

        return;

    }


} else {

    /* ====================================
       NUOVO EVENTO
    ==================================== */

    const nuovoEvento = {

        data:
            dataComeStringa(
                giornoSelezionato
            ),

        titolo:
            titolo,

        inizio:
            inizio,

        fine:
            fine,

        note:
            note

    };


    try {

        const eventoCreato =
            await creaEventoSuSupabase(
                nuovoEvento
            );


        eventi.push(
            eventoCreato
        );

    } catch (errore) {

        alert(
            "Errore nel salvataggio dell'evento."
        );

        return;

    }

}


        eventFormContainer.classList.add(
            "hidden"
        );


        eventoInModifica = null;


        deleteEventButton.classList.add(
            "hidden"
        );


        creaOrari();


        aggiornaRiepilogo();

    }
);


/* ========================================
   CONVERTI DATA IN STRINGA
======================================== */

function dataComeStringa(data) {

    const anno =
        data.getFullYear();


    const mese =
        String(
            data.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const giorno =
        String(
            data.getDate()
        ).padStart(
            2,
            "0"
        );


    return (
        anno +
        "-" +
        mese +
        "-" +
        giorno
    );

}


/* ========================================
   MOSTRA EVENTI
======================================== */

function mostraEventi() {

    /*
       Recuperiamo gli eventi del giorno.
    */

    if (!giornoSelezionato) {

        return;

    }


    const dataStringa =
        dataComeStringa(
            giornoSelezionato
        );


    const eventiDelGiorno =
        eventi.filter(
            function (evento) {

                return (
                    evento.data ===
                    dataStringa
                );

            }
        );


    /*
       Per ogni evento creiamo
       una vera fascia sulla timeline.
    */

    eventiDelGiorno.forEach(
        function (evento) {

            creaFasciaEvento(
                evento
            );

        }
    );


    aggiornaRiepilogo();

}


/* ========================================
   CREA FASCIA EVENTO
======================================== */

/* ========================================
   CREA FASCIA EVENTO
======================================== */

function creaFasciaEvento(evento) {

    const elemento =
        document.createElement("div");

    elemento.classList.add("event");


    /* ====================================
       POSIZIONE VERTICALE
    ==================================== */

    const [oraInizio, minutoInizio] =
        evento.inizio
            .split(":")
            .map(Number);

    const [oraFine, minutoFine] =
        evento.fine
            .split(":")
            .map(Number);


    const minutiInizio =
        (oraInizio * 60) +
        minutoInizio;

    const minutiFine =
        (oraFine * 60) +
        minutoFine;


    /*
       La timeline parte dalle 07:00.
    */

    const inizioTimeline =
        7 * 60;


    /*
       Ogni 30 minuti corrisponde
       a 45px di altezza.
    */

    const altezzaMezzora = 45;


    const minutiDallInizio =
        minutiInizio -
        inizioTimeline;


    const durata =
        minutiFine -
        minutiInizio;


    const posizione =
        (minutiDallInizio / 30) *
        altezzaMezzora;


    const altezza =
        (durata / 30) *
        altezzaMezzora;


    elemento.style.position =
        "absolute";

    elemento.style.top =
        posizione + "px";

    elemento.style.height =
        altezza + "px";


    /* ====================================
       COLORE MUSEO
    ==================================== */

    if (isEventoMuseo(evento)) {

        elemento.classList.add(
            "evento-museo"
        );

    }


    /* ====================================
       TITOLO
    ==================================== */

    const titolo =
        document.createElement("div");

    titolo.classList.add(
        "event-title"
    );

    titolo.textContent =
        evento.titolo;


    /* ====================================
       ORARIO
    ==================================== */

    const orario =
        document.createElement("div");

    orario.classList.add(
        "event-time"
    );

    orario.textContent =
        evento.inizio +
        " - " +
        evento.fine;


    elemento.appendChild(titolo);

    elemento.appendChild(orario);


    /* ====================================
       NOTE
    ==================================== */

    if (evento.note) {

        const note =
            document.createElement("div");

        note.classList.add(
            "event-notes"
        );

        note.textContent =
            evento.note;

        elemento.appendChild(note);

    }


    /* ====================================
       MODIFICA EVENTO
    ==================================== */

    elemento.addEventListener(
        "click",
        function(event) {

            event.stopPropagation();

            modificaEvento(
                evento
            );

        }
    );


    /*
       Inseriamo l'evento
       nella timeline.
    */

    hoursContainer.appendChild(
        elemento
    );

}


/* ========================================
   MODIFICA EVENTO
======================================== */

function modificaEvento(evento) {

    eventoInModifica =
        evento;


    formTitle.textContent =
        "Modifica evento";


    deleteEventButton.classList.remove(
        "hidden"
    );


    eventTitle.value =
        evento.titolo;


    eventStart.value =
        evento.inizio;


    eventEnd.value =
        evento.fine;


    eventNotes.value =
        evento.note || "";


    eventFormContainer.classList.remove(
        "hidden"
    );


    eventTitle.focus();

}


/* ========================================
   ELIMINA EVENTO
======================================== */

deleteEventButton.addEventListener(
    "click",
    async function () {

        if (
            eventoInModifica === null
        ) {

            return;

        }


        const conferma =
            confirm(
                "Vuoi davvero eliminare questo evento?"
            );


        if (!conferma) {

            return;

        }


        const idDaEliminare =
            eventoInModifica.id;


       try {

    await eliminaEventoSuSupabase(
        idDaEliminare
    );

} catch (errore) {

    alert(
        "Errore durante l'eliminazione dell'evento."
    );

    return;

}


eventi =
    eventi.filter(
        function (evento) {

            return (
                evento.id !==
                idDaEliminare
            );

        }
    );


        eventFormContainer.classList.add(
            "hidden"
        );


        eventoInModifica = null;


        deleteEventButton.classList.add(
            "hidden"
        );


        creaOrari();


        aggiornaRiepilogo();

    }
);


/* ========================================
   ANNULLA
======================================== */

cancelEventButton.addEventListener(
    "click",
    function () {

        eventFormContainer.classList.add(
            "hidden"
        );


        eventoInModifica = null;


        deleteEventButton.classList.add(
            "hidden"
        );

    }
);


/* ========================================
   RIEPILOGO
======================================== */

function aggiornaRiepilogo() {

    if (!giornoSelezionato) {

        return;

    }


    const dataStringa =
        dataComeStringa(
            giornoSelezionato
        );


    const eventiDelGiorno =
        eventi.filter(
            function (evento) {

                return (
                    evento.data ===
                    dataStringa
                );

            }
        );


    eventCount.textContent =
        eventiDelGiorno.length;


    aggiornaOreServizioCivile();


    aggiornaOreSettimanali();

}


/* ========================================
   TORNA AL CALENDARIO
======================================== */

backButton.addEventListener(
    "click",
    function () {

        dayView.classList.add(
            "hidden"
        );


        calendarView.classList.remove(
            "hidden"
        );


        eventFormContainer.classList.add(
            "hidden"
        );


        eventoInModifica = null;


        deleteEventButton.classList.add(
            "hidden"
        );

    }
);

/* ========================================
   TODO LIST
======================================== */

let attivita = [];


async function caricaAttivitaDaSupabase() {

    const { data, error } =
        await supabaseClient
            .from("attivita")
            .select("*")
            .order("completata")
            .order("scadenza", {
                ascending: true,
                nullsFirst: false
            });

    if (error) {

        console.error(
            "Errore caricamento attività:",
            error
        );

        return;
    }

    attivita = data || [];

    mostraAttivita();
}


function mostraAttivita() {

    const lista =
        document.getElementById(
            "todo-list"
        );

    const conteggio =
        document.getElementById(
            "todo-count"
        );


    lista.innerHTML = "";


    const daFare =
        attivita.filter(
            function (attivita) {
                return !attivita.completata;
            }
        ).length;


    const completate =
        attivita.filter(
            function (attivita) {
                return attivita.completata;
            }
        ).length;


    conteggio.textContent =
        daFare +
        " da fare · " +
        completate +
        " completate";


    attivita.forEach(
        function (attivita) {

            const elemento =
                document.createElement(
                    "div"
                );

            elemento.classList.add(
                "todo-item"
            );


            if (attivita.completata) {

                elemento.classList.add(
                    "completata"
                );

            }


            const checkbox =
                document.createElement(
                    "input"
                );

            checkbox.type = "checkbox";

            checkbox.classList.add(
                "todo-checkbox"
            );

            checkbox.checked =
                attivita.completata;


            const contenuto =
                document.createElement(
                    "div"
                );

            contenuto.classList.add(
                "todo-content"
            );


            const titolo =
                document.createElement(
                    "div"
                );

            titolo.classList.add(
                "todo-title"
            );

            titolo.textContent =
                attivita.titolo;


            contenuto.appendChild(
                titolo
            );


            if (attivita.scadenza) {

                const scadenza =
                    document.createElement(
                        "div"
                    );

                scadenza.classList.add(
                    "todo-deadline"
                );

                scadenza.textContent =
                    "📅 Scadenza: " +
                    attivita.scadenza;

                contenuto.appendChild(
                    scadenza
                );

            }


            if (attivita.note) {

                const note =
                    document.createElement(
                        "div"
                    );

                note.classList.add(
                    "todo-notes"
                );

                note.textContent =
                    attivita.note;

                contenuto.appendChild(
                    note
                );

            }


            const azioni =
                document.createElement(
                    "div"
                );

            azioni.classList.add(
                "todo-actions"
            );


            const modifica =
                document.createElement(
                    "button"
                );

            modifica.type = "button";

            modifica.textContent = "✏️";

            modifica.title =
                "Modifica attività";


            const elimina =
                document.createElement(
                    "button"
                );

            elimina.type = "button";

            elimina.textContent = "🗑️";

            elimina.title =
                "Elimina attività";


            azioni.appendChild(
                modifica
            );

            azioni.appendChild(
                elimina
            );


            elemento.appendChild(
                checkbox
            );

            elemento.appendChild(
                contenuto
            );

            elemento.appendChild(
                azioni
            );


            lista.appendChild(
                elemento
            );

        }
    );
}

/* ========================================
   AVVIO
======================================== */

async function avviaCalendarioDopoLogin() {

    try {

        const {
            data: { session }
        } = await supabaseClient.auth.getSession();

        if (!session) {

            loginScreen.classList.remove(
                "hidden"
            );

            return;
        }

        loginScreen.classList.add(
            "hidden"
        );

        await migraEventiLocaliSeNecessario();

       await caricaEventiDaSupabase();

await caricaAttivitaDaSupabase();

creaCalendario();

    } catch (errore) {

        console.error(
            "Errore avvio applicazione:",
            errore
        );

    }

}


avviaCalendarioDopoLogin();
