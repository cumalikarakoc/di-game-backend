import * as express from "express";
import Schema from "../models/Schema";
import Table from "../models/Table";

const router = express.Router();

let challengeIndex = 0;

const stuk = new Table("Stuk", ["stuknr", "titel", "componistId", "stukOrigineel", "genrenaam", "niveaucode"], [
    {stuknr: 1, titel: "Blue bird", componistId: 1, stukOrigineel: null, genrenaam: "jazz", niveaucode: null},
    {stuknr: 2, titel: "Blue bird", componistId: 2, stukOrigineel: 1, genrenaam: "jazz", niveaucode: "B"},
    {stuknr: 3, titel: "Air pur charmer", componistId: 4, stukOrigineel: null, genrenaam: "klassiek", niveaucode: "B"},
    {stuknr: 5, titel: "Lina", componistId: 5, stukOrigineel: null, genrenaam: "klassiek", niveaucode: "B"},
    {stuknr: 8, titel: "Berceuse", componistId: 8, stukOrigineel: null, genrenaam: "klassiek", niveaucode: null},
    {stuknr: 9, titel: "Cradle song", componistId: 2, stukOrigineel: 8, genrenaam: "klassiek", niveaucode: "B"},
    {stuknr: 10, titel: "Non piu andrai", componistId: 8, stukOrigineel: null, genrenaam: "pop", niveaucode: null},
    {stuknr: 12, titel: "I'll never go", componistId: 9, stukOrigineel: 10, genrenaam: "jazz", niveaucode: "A"},
    {stuknr: 13, titel: "Swinging Lina", componistId: 10, stukOrigineel: 5, genrenaam: "klassiek", niveaucode: "B"},
    {stuknr: 14, titel: "Little Lina", componistId: 5, stukOrigineel: 1, genrenaam: "jazz", niveaucode: "A"},
    {stuknr: 15, titel: "Blue sky", componistId: 10, stukOrigineel: 1, genrenaam: "jazz", niveaucode: "A"}]);

const componist = new Table("Componist", ["componistId", "naam"], [
    {componistId: 1, naam: "Charlie Parker"},
    {componistId: 2, naam: "Thom Guidi"},
    {componistId: 4, naam: "Rudolf Escher"},
    {componistId: 5, naam: "Sofie Bergeijk"},
    {componistId: 8, naam: "W.A. Mozart"},
    {componistId: 9, naam: "W.A. Mozart"},
    {componistId: 10, naam: "Jan van Maanen"}]);

const muziekschool = new Table("Muziekschool", ["schoolId", "naam"], [
    {schoolId: 1, naam: "Muziekschool Amsterdam"},
    {schoolId: 2, naam: "Reijnders' Muziekschool"},
    {schoolId: 3, naam: "Het Muziekpakhuis"}]);

const orders = new Table("orders", ["ordernr", "customerId", "orderdate", "orderstatus"], [
    {ordernr: 1, customerid: 1, orderdate: "2019-02-17", orderstatus: "Registrated"},
    {ordernr: 2, customerid: 1, orderdate: "2019-02-18", orderstatus: "Ready"},
    {ordernr: 3, customerid: 2, orderdate: "2019-03-18", orderstatus: "Ready"},
]);

const customers = new Table("customers", ["customerId", "customername"], [
    {customerId: 1, customername: "Nabben"},
    {customerId: 2, customername: "Ethan"},
]);

const challenges = [
    {
        description: "Welke stukken zijn gecomponeerd door een muziekschooldocent? Geef van de betreffende stukken het stuknr, de titel, de naam van de componist en de naam van de muziekschool.",
        schema: new Schema([stuk, componist, muziekschool]),
    },
    {
        description: "Geef het nummer en de naam van de muziekscholen waarvoor meer dan drie speelstukken bestaan die gecomponeerd zijn door docenten van de betreffende school.",
        schema: new Schema([stuk, componist, muziekschool]),
    },
    {
        description: " Geef componistId en naam van iedere componist die meer dan 1 stuk heeft gecomponeerd. Gebruik EXISTS.",
        schema: new Schema([stuk, componist]),
    },
    {
        description: "Schrijf een trigger die voorkomt dat er een order toegevoegd kan worden als er al 3 orders met orderstatus ready zijn.",
        schema: new Schema([orders, customers]),
    },
    {
        description: "Schrijf een constraint voor de order tabel die ervoor zorgt dat een orderstatus alleen Registrated of Ready is.",
        schema: new Schema([orders, customers]),
    },
    {
        description: " Geef alle originele stukken waar geen bewerkingen van zijn.. Gebruik EXISTS.",
        schema: new Schema([stuk]),
    },
    {
        description: "Schrijf een stored procedure die, gegeven een OrderStatus, alle records geeft uit Orders met die OrderStatus. Geef de CustomerID, de CustomerName, het OrderNr en de OrderStatus.",
        schema: new Schema([orders, customers]),
    },
    {
        description: "Schrijf een stored procedure die gegeven een CustomerName en een OrderStatus het aantal orders teruggeeft dat die customer heeft met die OrderStatus.",
        schema: new Schema([orders, customers]),
    }
];

router.get("/next", async (req: any, res) => {
    req.helpers.io.emit("next challenge", challenges[challengeIndex]);

    challengeIndex++;

    if (challengeIndex === challenges.length) {
        challengeIndex = 0;
    }

    return res.send({success: true});
});

router.get("/current", async (req: any, res) => {
    return res.send({challenge: challenges[challengeIndex]});
});

export default router;
