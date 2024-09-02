const fs = require('fs');
const path = require('path');

function loadJsonFile(filename) {
    const filepath = path.join(__dirname, filename);
    const fileContent = fs.readFileSync(filepath, 'utf-8');
    return JSON.parse(fileContent);
}

function simulateMatch(teamA, teamB) {
    if (!teamA || !teamB) {
        throw new Error("simulateMatch function received undefined team objects.");
    }
    const rankingDifference = teamB.FIBARanking - teamA.FIBARanking;
    const probabilityA = 0.5 + rankingDifference / 100;
    const scoreA = Math.floor(Math.random() * (30) + 80);
    const scoreB = Math.floor(Math.random() * (30) + 80);

    const winner = Math.random() < probabilityA ? teamA : teamB;
    const loser = winner === teamA ? teamB : teamA;

    return {
        winner,
        loser,
        scoreA: winner === teamA ? scoreA : scoreB,
        scoreB: winner === teamB ? scoreA : scoreB,
    };
}

function drawEliminationStage(teams) {
    const hats = {
        D: teams.slice(0, 2), // Teams ranked 1 and 2
        E: teams.slice(2, 4), // Teams ranked 3 and 4
        F: teams.slice(4, 6), // Teams ranked 5 and 6
        G: teams.slice(6, 8)  // Teams ranked 7 and 8
    };

    const quarterFinals = [];

    // Draw matchups ensuring teams from the same group don't face each other
    for (const hatDTeam of hats.D) {
        if (!hatDTeam) {
            console.error("Undefined team in Hat D");
            continue;
        }

        for (const hatGTeam of hats.G) {
            if (!hatGTeam) {
                console.error("Undefined team in Hat G");
                continue;
            }

            if (!teamsInSameGroup(hatDTeam, hatGTeam)) {
                quarterFinals.push([hatDTeam, hatGTeam]);
                hats.G.splice(hats.G.indexOf(hatGTeam), 1); // Remove team from Hat G
                break;
            }
        }
    }

    for (const hatETeam of hats.E) {
        if (!hatETeam) {
            console.error("Undefined team in Hat E");
            continue;
        }

        for (const hatFTeam of hats.F) {
            if (!hatFTeam) {
                console.error("Undefined team in Hat F");
                continue;
            }

            if (!teamsInSameGroup(hatETeam, hatFTeam)) {
                quarterFinals.push([hatETeam, hatFTeam]);
                hats.F.splice(hats.F.indexOf(hatFTeam), 1); // Remove team from Hat F
                break;
            }
        }
    }

    // Log the state of quarterFinals
    console.log("Drawn Quarterfinals:", quarterFinals);

    // Check for undefined or null values
    for (const matchup of quarterFinals) {
        if (matchup.some(team => team === undefined || team === null)) {
            console.error("Undefined or null team detected in elimination stage draw.");
            throw new Error("Undefined or null team detected in elimination stage draw.");
        }
    }

    return quarterFinals;
}


function teamsInSameGroup(teamA, teamB) {
    // Define the groups as per your earlier implementation
    const groups = {
        A: ["CAN", "AUS", "GRE", "ESP"],
        B: ["GER", "FRA", "BRA", "JPN"],
        C: ["USA", "SRB", "SSD", "PRI"]
    };

    // Find which group each team belongs to
    const groupA = Object.keys(groups).find(group => groups[group].includes(teamA.ISOCode));
    const groupB = Object.keys(groups).find(group => groups[group].includes(teamB.ISOCode));

    return groupA === groupB;
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function simulateEliminationRound(matchups) {
    if (!Array.isArray(matchups) || matchups.length === 0) {
        throw new Error('Invalid matchups array.');
    }

    const winners = [];

    matchups.forEach((matchup, index) => {
        if (!Array.isArray(matchup) || matchup.length !== 2) {
            console.error(`Invalid matchup format at index ${index + 1}: ${JSON.stringify(matchup)}`);
            throw new Error(`Invalid matchup format at index ${index + 1}`);
        }

        const [teamA, teamB] = matchup;

        if (!teamA || !teamB) {
            console.error(`Undefined team detected in matchup ${index + 1}: ${JSON.stringify(matchup)}`);
            throw new Error(`simulateEliminationRound received undefined team objects at matchup ${index + 1}`);
        }

        console.log(`Simulating match between ${teamA.Team} and ${teamB.Team}`);

        const { winner } = simulateMatch(teamA, teamB);
        winners.push(winner);
        console.log(`${teamA.Team} vs ${teamB.Team} - Winner: ${winner.Team}`);
    });

    return winners;
}


function rankTeamsByStandings(standings) {
    const allTeams = [];

    // Collect all teams from all groups
    for (const group in standings) {
        allTeams.push(...standings[group]);
    }

    // Sort teams by points, then by point difference, then by points scored
    allTeams.sort((a, b) => {
        if (b.points === a.points) {
            if (b.pointDifference === a.pointDifference) {
                return b.pointsScored - a.pointsScored;
            }
            return b.pointDifference - a.pointDifference;
        }
        return b.points - a.points;
    });

    return allTeams;
}

function simulateGroupStage(groups, exibitionResults) {
    const standings = {};

    // Initialize standings for each group
    for (const group in groups) {
        standings[group] = groups[group].map(team => ({
            ...team,
            wins: 0,
            losses: 0,
            points: 0,
            pointsScored: 0,
            pointsConceded: 0,
            pointDifference: 0
        }));
    }

    // Simulate the matches for each group
    for (const group in groups) {
        const teams = standings[group];
        console.log(`\nGroup ${group} matches:`);

        // Each team plays against each other team in the group
        for (let i = 0; i < teams.length; i++) {
            for (let j = i + 1; j < teams.length; j++) {
                const teamA = teams[i];
                const teamB = teams[j];
                const { winner, loser, scoreA, scoreB } = simulateMatch(teamA, teamB);

                console.log(`${teamA.Team} vs ${teamB.Team} (${scoreA}:${scoreB}) - Winner: ${winner.Team}`);

                // Update standings
                winner.wins += 1;
                loser.losses += 1;

                winner.points += 2;
                loser.points += 1;

                winner.pointsScored += scoreA;
                winner.pointsConceded += scoreB;
                loser.pointsScored += scoreB;
                loser.pointsConceded += scoreA;

                winner.pointDifference = winner.pointsScored - winner.pointsConceded;
                loser.pointDifference = loser.pointsScored - loser.pointsConceded;
            }
        }

        // Sort teams by points, then by point difference, then by points scored
        standings[group].sort((a, b) => {
            if (b.points === a.points) {
                if (b.pointDifference === a.pointDifference) {
                    return b.pointsScored - a.pointsScored;
                }
                return b.pointDifference - a.pointDifference;
            }
            return b.points - a.points;
        });

        console.log(`\nGroup ${group} standings:`);
        standings[group].forEach((team, index) => {
            console.log(`${index + 1}. ${team.Team} - Wins: ${team.wins}, Losses: ${team.losses}, Points: ${team.points}, Points Scored: ${team.pointsScored}, Points Conceded: ${team.pointsConceded}, Point Difference: ${team.pointDifference}`);
        });
    }

    return standings;
}

function main() {
    const groups = loadJsonFile('groups.json');
    const exibitionResults = loadJsonFile('exibitions.json');

    const teamStandings = simulateGroupStage(groups, exibitionResults);
    console.log("Team Standings:", teamStandings);

    const rankedTeams = rankTeamsByStandings(teamStandings);
    console.log("Ranked Teams:", rankedTeams);

    const teams = rankedTeams.slice(0, 8); // Ensure the correct number of teams
    console.log("Teams for Elimination Stage:", teams);

    // Draw elimination stage
    const quarterFinals = drawEliminationStage(teams);
    console.log("Quarterfinals Draw:", quarterFinals);

    // Simulate elimination rounds
    const semiFinalists = simulateEliminationRound(quarterFinals);
    console.log("Semifinals Draw:", semiFinalists);

    const finalists = [
        [semiFinalists[0], semiFinalists[2]],
        [semiFinalists[1], semiFinalists[3]]
    ];
    console.log("Finals Matchups:", finalists);

    const [goldMedalist, silverMedalist] = simulateEliminationRound(finalists);
    console.log("Finals Winner:", goldMedalist.Team);
    console.log("Finals Runner-up:", silverMedalist.Team);

    console.log("Bronze Match:");
    const bronzeMatchup = [
        [semiFinalists[0] === goldMedalist ? semiFinalists[1] : semiFinalists[0], semiFinalists[2] === silverMedalist ? semiFinalists[3] : semiFinalists[2]]
    ];
    const [bronzeMedalist] = simulateEliminationRound(bronzeMatchup);
    console.log("Bronze Medalist:", bronzeMedalist.Team);
}



main();
