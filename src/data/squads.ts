export interface Player {
    name: string;
    number: number;
    position: 'GK' | 'DEF' | 'MID' | 'FWD';
}

export interface Squad {
    team: string;
    flag: string;
    players: Player[];
}

export const argentinaSquad: Squad = {
    team: 'Argentina',
    flag: '🇦🇷',
    players: [
    {
        "name": "Juan Musso",
        "number": 1,
        "position": "GK"
    },
    {
        "name": "Gerónimo Rulli",
        "number": 12,
        "position": "GK"
    },
    {
        "name": "Emiliano Martínez",
        "number": 23,
        "position": "GK"
    },
    {
        "name": "Marcos Senesi",
        "number": 2,
        "position": "DEF"
    },
    {
        "name": "Nicolás Tagliafico",
        "number": 3,
        "position": "DEF"
    },
    {
        "name": "Gonzalo Montiel",
        "number": 4,
        "position": "DEF"
    },
    {
        "name": "Lisandro Martínez",
        "number": 6,
        "position": "DEF"
    },
    {
        "name": "Cristian Romero",
        "number": 13,
        "position": "DEF"
    },
    {
        "name": "Nicolás Otamendi",
        "number": 19,
        "position": "DEF"
    },
    {
        "name": "Facundo Medina",
        "number": 25,
        "position": "DEF"
    },
    {
        "name": "Nahuel Molina",
        "number": 26,
        "position": "DEF"
    },
    {
        "name": "Leandro Paredes",
        "number": 5,
        "position": "MID"
    },
    {
        "name": "Rodrigo De Paul",
        "number": 7,
        "position": "MID"
    },
    {
        "name": "Valentín Barco",
        "number": 8,
        "position": "MID"
    },
    {
        "name": "Giovani Lo Celso",
        "number": 11,
        "position": "MID"
    },
    {
        "name": "Exequiel Palacios",
        "number": 14,
        "position": "MID"
    },
    {
        "name": "Nicolás González",
        "number": 15,
        "position": "MID"
    },
    {
        "name": "Thiago Almada",
        "number": 16,
        "position": "MID"
    },
    {
        "name": "Giuliano Simeone",
        "number": 17,
        "position": "MID"
    },
    {
        "name": "Nico Paz",
        "number": 18,
        "position": "MID"
    },
    {
        "name": "Alexis Mac Allister",
        "number": 20,
        "position": "MID"
    },
    {
        "name": "Enzo Fernández",
        "number": 24,
        "position": "MID"
    },
    {
        "name": "Julián Álvarez",
        "number": 9,
        "position": "FWD"
    },
    {
        "name": "Lionel Messi",
        "number": 10,
        "position": "FWD"
    },
    {
        "name": "José López",
        "number": 21,
        "position": "FWD"
    },
    {
        "name": "Lautaro Martínez",
        "number": 22,
        "position": "FWD"
    }
]
};

export const spainSquad: Squad = {
    team: 'Spain',
    flag: '🇪🇸',
    players: [
    {
        "name": "David Raya",
        "number": 1,
        "position": "GK"
    },
    {
        "name": "Joan García",
        "number": 13,
        "position": "GK"
    },
    {
        "name": "Unai Simón",
        "number": 23,
        "position": "GK"
    },
    {
        "name": "Marc Pubill",
        "number": 2,
        "position": "DEF"
    },
    {
        "name": "Eric García",
        "number": 4,
        "position": "DEF"
    },
    {
        "name": "Marcos Llorente",
        "number": 5,
        "position": "DEF"
    },
    {
        "name": "Pedro Porro",
        "number": 12,
        "position": "DEF"
    },
    {
        "name": "Aymeric Laporte",
        "number": 14,
        "position": "DEF"
    },
    {
        "name": "Pau Cubarsí",
        "number": 22,
        "position": "DEF"
    },
    {
        "name": "Marc Cucurella",
        "number": 24,
        "position": "DEF"
    },
    {
        "name": "Alejandro Grimaldo",
        "number": 3,
        "position": "MID"
    },
    {
        "name": "Mikel Merino",
        "number": 6,
        "position": "MID"
    },
    {
        "name": "Fabián Ruiz",
        "number": 8,
        "position": "MID"
    },
    {
        "name": "Gavi",
        "number": 9,
        "position": "MID"
    },
    {
        "name": "Dani Olmo",
        "number": 10,
        "position": "MID"
    },
    {
        "name": "Yéremi Pino",
        "number": 11,
        "position": "MID"
    },
    {
        "name": "Álex Baena",
        "number": 15,
        "position": "MID"
    },
    {
        "name": "Rodri",
        "number": 16,
        "position": "MID"
    },
    {
        "name": "Martín Zubimendi",
        "number": 18,
        "position": "MID"
    },
    {
        "name": "Pedri",
        "number": 20,
        "position": "MID"
    },
    {
        "name": "Ferran Torres",
        "number": 7,
        "position": "FWD"
    },
    {
        "name": "Nico Williams",
        "number": 17,
        "position": "FWD"
    },
    {
        "name": "Lamine Yamal",
        "number": 19,
        "position": "FWD"
    },
    {
        "name": "Mikel Oyarzabal",
        "number": 21,
        "position": "FWD"
    },
    {
        "name": "Víctor Muñoz",
        "number": 25,
        "position": "FWD"
    },
    {
        "name": "Borja Iglesias",
        "number": 26,
        "position": "FWD"
    }
]
};

export const allPlayers = [
    ...argentinaSquad.players.map(p => ({ ...p, team: 'Argentina' as const })),
    ...spainSquad.players.map(p => ({ ...p, team: 'Spain' as const })),
];

export const getPlayersByTeam = (team: 'Argentina' | 'Spain') => {
    return team === 'Argentina' ? argentinaSquad.players : spainSquad.players;
};
