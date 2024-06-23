document.addEventListener("DOMContentLoaded", function() {
    const teamSelects = {
        teamA: ["teamAPlayer1", "teamAPlayer2", "teamAPlayer3"],
        teamB: ["teamBPlayer1", "teamBPlayer2", "teamBPlayer3"],
        teamC: ["teamCPlayer1", "teamCPlayer2", "teamCPlayer3"],
        teamD: ["teamDPlayer1", "teamDPlayer2", "teamDPlayer3"],
        teamE: ["teamEPlayer1", "teamEPlayer2", "teamEPlayer3"],
        teamF: ["teamFPlayer1", "teamFPlayer2", "teamFPlayer3"]
    };

    const divisions = {
        teamA: { name: "Ere", min: 30, max: 57 },
        teamB: { name: "Ere", min: 30, max: 57 },
        teamC: { name: "1e", min: 18, max: 33 },
        teamD: { name: "2e", min: 12, max: 18 },
        teamE: { name: "3e", min: 6, max: 12 },
        teamF: { name: "4e", min: 3, max: 6 }
    };

    const warningMessagesDiv = document.querySelector(".warnings");

    function fetchPlayers() {
        return fetch('players.json')
            .then(response => response.json())
            .then(data => {
                // Add the "Walk-Over" player if not present
                if (!data.some(player => player.name === "Walk-Over")) {
                    data.push({ name: "Walk-Over", ranking: 1, points: 0 });
                }
                return data;
            });
    }

    function populateDropdowns(players) {
        Object.values(teamSelects).flat().forEach(id => {
            const select = document.getElementById(id);
            // Add a blank option as the first option
            const blankOption = document.createElement("option");
            blankOption.value = "";
            blankOption.textContent = "";
            select.appendChild(blankOption);

            players.forEach(player => {
                const option = document.createElement("option");
                option.value = player.name;
                option.textContent = `${player.name} - ${player.ranking} (${player.points})`;
                select.appendChild(option);
            });
        });
    }

    function updateWarnings(players) {
        const selectedPlayers = new Map();

        // Clear all existing warnings
        warningMessagesDiv.innerHTML = '<h2>Warning Messages</h2><hr>';

        Object.entries(teamSelects).forEach(([team, ids]) => {
            let teamSum = 0;
            let selectedCount = 0;
            ids.forEach(id => {
                const select = document.getElementById(id);
                const selected = select.value;
                if (selected) {
                    const player = players.find(p => p.name === selected);
                    teamSum += player.ranking;
                    selectedCount++;
                    if (selectedPlayers.has(selected)) {
                        selectedPlayers.set(selected, selectedPlayers.get(selected) + 1);
                    } else {
                        selectedPlayers.set(selected, 1);
                    }
                }
            });
            document.getElementById(`${team}Sum`).textContent = teamSum;

            // Check if the team selection is complete
            const incompleteWarningId = `${team}IncompleteWarning`;
            if (selectedCount < 3) {
                const warningMessage = document.createElement("p");
                warningMessage.id = incompleteWarningId;
                warningMessage.textContent = `Team ${team.toUpperCase().slice(4)} selection is not complete.`;
                warningMessage.style.color = "orange";
                warningMessagesDiv.appendChild(warningMessage);
            } else {
                // Check if the team total ranking is within the division min and max
                const { min, max } = divisions[team];
                if (teamSum < min || teamSum > max) {
                    const warningMessage = document.createElement("p");
                    warningMessage.textContent = `Team ${team.toUpperCase().slice(4)} total value is outside min and max interval.`;
                    warningMessage.style.color = "orange";
                    warningMessagesDiv.appendChild(warningMessage);
                }
            }
        });

        Object.values(teamSelects).flat().forEach(id => {
            const select = document.getElementById(id);
            [...select.options].forEach(option => {
                option.classList.remove("highlight");
                if (option.value !== 'Walk-Over' && selectedPlayers.has(option.value) && selectedPlayers.get(option.value) > 1) {
                    option.classList.add("highlight");
                }
            });

            // Highlight the selected option if it is chosen more than once, excluding "Walk-Over"
            const selectedOption = select.options[select.selectedIndex];
            if (selectedOption && selectedOption.value !== 'Walk-Over' && selectedPlayers.get(selectedOption.value) > 1) {
                select.classList.add("highlight");
            } else {
                select.classList.remove("highlight");
            }
        });
    }

    // Populate competition week dropdown
    const competitionWeekSelect = document.getElementById("competitionWeek");
    for (let i = 1; i <= 20; i++) {
        const option = document.createElement("option");
        option.value = `week${i}`;
        option.textContent = `Week ${i}`;
        competitionWeekSelect.appendChild(option);
    }

    fetchPlayers().then(players => {
        populateDropdowns(players);
        Object.values(teamSelects).flat().forEach(id => {
            document.getElementById(id).addEventListener("change", () => updateWarnings(players));
        });
        updateWarnings(players);
    });
});
