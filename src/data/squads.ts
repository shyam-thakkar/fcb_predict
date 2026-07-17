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
        // Goalkeepers
        { name: 'Emiliano Martínez', number: 23, position: 'GK' },
        { name: 'Franco Armani', number: 1, position: 'GK' },
        { name: 'Gerónimo Rulli', number: 12, position: 'GK' },
        // Defenders
        { name: 'Nicolás Otamendi', number: 19, position: 'DEF' },
        { name: 'Cristian Romero', number: 13, position: 'DEF' },
        { name: 'Lisandro Martínez', number: 25, position: 'DEF' },
        { name: 'Nahuel Molina', number: 26, position: 'DEF' },
        { name: 'Nicolás Tagliafico', number: 3, position: 'DEF' },
        { name: 'Gonzalo Montiel', number: 4, position: 'DEF' },
        { name: 'Marcos Acuña', number: 8, position: 'DEF' },
        // Midfielders
        { name: 'Rodrigo De Paul', number: 7, position: 'MID' },
        { name: 'Enzo Fernández', number: 24, position: 'MID' },
        { name: 'Alexis Mac Allister', number: 20, position: 'MID' },
        { name: 'Leandro Paredes', number: 5, position: 'MID' },
        { name: 'Giovani Lo Celso', number: 18, position: 'MID' },
        { name: 'Exequiel Palacios', number: 14, position: 'MID' },
        { name: 'Enzo Barrenechea', number: 16, position: 'MID' },
        // Forwards
        { name: 'Lionel Messi', number: 10, position: 'FWD' },
        { name: 'Julián Álvarez', number: 9, position: 'FWD' },
        { name: 'Lautaro Martínez', number: 22, position: 'FWD' },
        { name: 'Ángel Di María', number: 11, position: 'FWD' },
        { name: 'Paulo Dybala', number: 21, position: 'FWD' },
        { name: 'Nicolás González', number: 15, position: 'FWD' },
        { name: 'Alejandro Garnacho', number: 17, position: 'FWD' },
        { name: 'Valentín Castellanos', number: 6, position: 'FWD' },
    ],
};

export const spainSquad: Squad = {
    team: 'Spain',
    flag: '🇪🇸',
    players: [
        // Goalkeepers
        { name: 'Unai Simón', number: 23, position: 'GK' },
        { name: 'David Raya', number: 13, position: 'GK' },
        { name: 'Robert Sánchez', number: 1, position: 'GK' },
        // Defenders
        { name: 'Dani Carvajal', number: 2, position: 'DEF' },
        { name: 'Aymeric Laporte', number: 14, position: 'DEF' },
        { name: 'Robin Le Normand', number: 24, position: 'DEF' },
        { name: 'Marc Cucurella', number: 3, position: 'DEF' },
        { name: 'Alejandro Grimaldo', number: 12, position: 'DEF' },
        { name: 'Nacho Fernández', number: 4, position: 'DEF' },
        { name: 'Pau Torres', number: 5, position: 'DEF' },
        // Midfielders
        { name: 'Pedri', number: 8, position: 'MID' },
        { name: 'Gavi', number: 6, position: 'MID' },
        { name: 'Rodri', number: 16, position: 'MID' },
        { name: 'Dani Olmo', number: 10, position: 'MID' },
        { name: 'Fabián Ruiz', number: 20, position: 'MID' },
        { name: 'Martín Zubimendi', number: 18, position: 'MID' },
        { name: 'Mikel Merino', number: 15, position: 'MID' },
        { name: 'Fermín López', number: 22, position: 'MID' },
        // Forwards
        { name: 'Lamine Yamal', number: 19, position: 'FWD' },
        { name: 'Nico Williams', number: 11, position: 'FWD' },
        { name: 'Álvaro Morata', number: 7, position: 'FWD' },
        { name: 'Ferran Torres', number: 17, position: 'FWD' },
        { name: 'Mikel Oyarzabal', number: 21, position: 'FWD' },
        { name: 'Joselu', number: 9, position: 'FWD' },
        { name: 'Ayoze Pérez', number: 25, position: 'FWD' },
    ],
};

export const allPlayers = [
    ...argentinaSquad.players.map(p => ({ ...p, team: 'Argentina' as const })),
    ...spainSquad.players.map(p => ({ ...p, team: 'Spain' as const })),
];

export const getPlayersByTeam = (team: 'Argentina' | 'Spain') => {
    return team === 'Argentina' ? argentinaSquad.players : spainSquad.players;
};
