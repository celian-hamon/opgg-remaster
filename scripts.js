user = findGetParameter("name");

apikey = "";

version = "12.5.1";

let summoner = {
    "id": "",
    "accountId": "",
    "puuid": "",
    "name": "",
    "profileIconId": 0,
    "revisionDate": 0,
    "summonerLevel": 0
};

async function loadUser() {
    //load summoner data
    response = await fetch("https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-name/" + user + "?api_key=" + apikey);
    data = await response.json();
    summoner.id = data.id;
    summoner.accountId = data.accountId;
    summoner.puuid = data.puuid;
    summoner.name = data.name;
    summoner.profileIconId = data.profileIconId;
    summoner.revisionDate = data.revisionDate;
    summoner.summonerLevel = data.summonerLevel;

    //load the profile picture
    document.getElementById("profile-picture").src = `http://ddragon.leagueoflegends.com/cdn/${version}/img/profileicon/${summoner.profileIconId}.png`

    //load summoner name
    document.getElementById("user-name").innerHTML = summoner.name;

    //load summoner level
    document.getElementById("user-level").innerHTML = "Level " + summoner.summonerLevel;

    //load summoner rank
    response = await fetch("https://euw1.api.riotgames.com/lol/league/v4/entries/by-summoner/" + summoner.id + "?api_key=" + apikey);
    data = await response.json();

    //try to assign rank 
    try {
        rank = data[0].tier + " " + data[0].rank;
        document.getElementById("user-rank").innerHTML = rank + ` <img src="/ranked-emblems/Emblem_${data[0].tier}.png" width="25px" alt="embleme tier ${rank}" >`;
    }
    catch (err) {
        document.getElementById("user-rank").innerHTML = "Unranked";
    }
}

async function loadChamps() {
    //load the most played champions
    let response = await fetch("https://euw1.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-summoner/" + summoner.id + "?api_key=" + apikey);
    let data = await response.json();

    //draw the 3 most played champion of the summoner
    for (let i = 0; i < 3; i++) {
        const champion = data[i];
        const champ = await getChampion(champion.championId);

        const card = document.createElement("div");

        championContent = document.createElement("div");
        championContent.className = "champion-content";
        //create the champion name
        const name = document.createElement("h4");
        name.innerHTML = champ.name;
        name.className = "champion-name";
        championContent.appendChild(name);

        //create the champion level
        const level = document.createElement("p");
        level.innerHTML = "Level " + champion.championLevel;
        level.className = "champion-level";
        championContent.appendChild(level);

        //create the champion points
        const points = document.createElement("p");
        points.innerHTML = champion.championPoints + " points";
        points.className = "champion-points";
        championContent.appendChild(points);

        card.appendChild(championContent);
        card.style.background = `url("http://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${champ.id}.png")`;
        card.style.backgroundSize = "cover";
        card.style.backgroundPosition = "center";
        card.style.backgroundRepeat = "no-repeat";
        card.className = "champion-card";

        document.getElementById("container-champ").appendChild(card);
    }

}

async function getChampion(id) {
    let response = await fetch(`http://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion.json`)
    let responseData = await response.json();
    responseData = responseData.data;
    for (var key in responseData) {
        if (responseData.hasOwnProperty(key)) {
            if (responseData[key].key == id) {
                return responseData[key];
            }
        }
    }
}

async function loadMatchHistory() {
    let response = await fetch("https://europe.api.riotgames.com/lol/match/v5/matches/by-puuid/" + summoner.puuid + "/ids?start=0&count=10&api_key=" + apikey);
    let data = await response.json();
    for (let i = 0; i < data.length; i++) {
        response = await fetch("https://europe.api.riotgames.com/lol/match/v5/matches/" + data[i] + "?api_key=" + apikey);
        datajson = await response.json();
        datamatch = datajson.info;

        //if the match isnt a regular match dont draw it 
        if (datamatch.gameMode == "PRACTICETOOL" || datamatch.gameType == "CUSTOM_GAME") {
            continue;
        }

        //create the match card
        const card = document.createElement("div");
        card.className = "match-card";
        card.classList.add("card");

        //create the match content
        const content = document.createElement("div");
        content.className = "match-content";


        //create the match type
        const type = document.createElement("h3");
        type.innerHTML = datamatch.gameMode;
        content.appendChild(type);

        //create the match duration
        const duration = document.createElement("p");
        //convert seconds to minutes
        duration.innerHTML = Math.floor(datamatch.gameDuration / 60) + " minutes";
        content.appendChild(duration);

        //create the match date
        const date = document.createElement("p");
        //convert date to readable format
        date.innerHTML = new Date(datamatch.gameCreation).toLocaleDateString();
        date.classList.add("match-date");
        content.appendChild(date);

        //create the summoner champion part
        const summonerChampion = document.createElement("div");
        summonerChampion.className = "match-summoner-champion";
        summonerChampion.classList.add("spawn");

        //retreive the player champion from the participants
        for (let i = 0; i < datamatch.participants.length; i++) {
            if (datamatch.participants[i].summonerId == summoner.id) {
                playerChamp = datamatch.participants[i];
            }
        }

        //create the match result
        const result = document.createElement("p");
        result.innerHTML = playerChamp.win ? "Victory" : "Defeat";
        result.classList.add(playerChamp.win ? "match-text-victory" : "match-text-defeat");
        content.appendChild(result);

        //create the summoner champion image
        const summonerChampImg = document.createElement("img");
        summonerChampImg.src = `http://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${playerChamp.championName}.png`;
        summonerChampImg.className = "match-summoner-champion-img";
        summonerChampion.appendChild(summonerChampImg);
        //add a layer over the image to display an inner shadow
        const summonerChampShadow = document.createElement("div");
        summonerChampShadow.className = "match-summoner-champion-shadow";
        summonerChampion.appendChild(summonerChampShadow);

        //create the summoner champion name
        const summonerChampionName = document.createElement("h6");
        summonerChampionName.style.textAlign = "center";

        summonerChampionName.innerHTML = playerChamp.championName;
        summonerChampionName.className = "match-summoner-champion-name";
        summonerChampion.appendChild(summonerChampionName);

        //retreive and create the summoner summoner spell
        response = await fetch(`http://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/summoner.json`)
        responseData = await response.json();
        summonerSpellJson = responseData.data;

        let summonerSpell1;
        let summonerSpell2;

        for (let key in summonerSpellJson) {
            if (summonerSpellJson.hasOwnProperty(key)) {
                if (summonerSpellJson[key].key == playerChamp.summoner1Id) {
                    summonerSpell1 = await summonerSpellJson[key];
                }
                if (summonerSpellJson[key].key == playerChamp.summoner2Id) {
                    summonerSpell2 = await summonerSpellJson[key];
                }
            }
        }

        const summonerSpell = document.createElement("div");
        summonerSpell.className = "match-summoner-spell";
        summonerSpell.innerHTML = `
            <div class="match-summoner-spell-imgs">
                <img src="http://ddragon.leagueoflegends.com/cdn/${version}/img/spell/${summonerSpell1.id}.png"  >
                <img src="http://ddragon.leagueoflegends.com/cdn/${version}/img/spell/${summonerSpell2.id}.png"  >
            </div>
        `
        summonerChampion.appendChild(summonerSpell);

        response = await fetch(`http://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/runesReforged.json`)
        runesJson = await response.json();

        let rune1;
        let rune2;

        for (let i = 0; i < runesJson.length; i++) {
            if (runesJson[i].id == playerChamp.perks.styles[0].style) {
                rune1 = await runesJson[i];
            }
            if (runesJson[i].id == playerChamp.perks.styles[1].style) {
                rune2 = await runesJson[i];
            }
        }

        //create the summoner champion runes 
        const summonerChampionRunes = document.createElement("div");
        summonerChampionRunes.className = "match-summoner-champion-runes";
        summonerChampionRunes.innerHTML = `
            <div class="match-summoner-spell-imgs">
                <img src="https://ddragon.canisback.com/img/${rune1.icon}" alt="first rune">
                <img src="https://ddragon.canisback.com/img/${rune2.icon}" alt="second rune">
            </div>
            `
        summonerChampion.appendChild(summonerChampionRunes);

        //stats part
        const stats = document.createElement("div");
        stats.className = "match-stats";
        stats.classList.add("spawn");

        //create the stats content
        const statsContent = document.createElement("div");
        statsContent.className = "match-stats-content";

        //create the stats title
        const statsTitle = document.createElement("h3");
        statsTitle.innerHTML = `${playerChamp.kills} / ${playerChamp.deaths} / ${playerChamp.assists}`;
        statsTitle.className = "match-stats-title";
        statsContent.appendChild(statsTitle);

        //create the KDA
        const statsKDA = document.createElement("h5");
        statsKDA.innerHTML = `${Math.round(100 * ((playerChamp.kills + playerChamp.assists) / playerChamp.deaths)) / 100} KDA`;
        statsKDA.className = "match-stats-kda";
        statsContent.appendChild(statsKDA);

        //create the streak item
        const statsStreak = document.createElement("h6");
        let bestStreak;
        const streakPossibility = ["doubleKills", "tripleKills", "quadraKills", "pentaKills"];
        const translateStreak = ["Double kill", "Triple kill", "Quadra kill", "Penta kill"];

        for (let i = 0; i < streakPossibility.length; i++) {
            if (playerChamp[streakPossibility[i]] != 0) {
                bestStreak = translateStreak[i];
                statsStreak.className = "match-stats-streak-" + streakPossibility[i];
            }
        }

        if (bestStreak != undefined) {
            statsStreak.innerHTML = bestStreak;
        }
        statsStreak.classList.add("match-stats-streak");
        statsContent.appendChild(statsStreak);

        stats.appendChild(statsContent);

        //second stats part
        const stats2 = document.createElement("div");
        stats2.classList.add("match-stats-misc");
        stats2.classList.add("match-stats");
        stats2.classList.add("spawn");

        //create the stats content
        /**
            champion level : ${playerChamp.championLevel}
            cs : ${playerChamp.minionsKilled}
            gold : ${playerChamp.goldEarned}
            vision score : ${playerChamp.visionScore}
         */
        const statsContent2 = document.createElement("div");
        statsContent2.className = "match-stats-content";
        stats2.appendChild(statsContent2);

        //create the stats champion level
        const statsChampionLevel = document.createElement("h5");
        statsChampionLevel.innerHTML = `${playerChamp.champLevel} LVL`;
        statsChampionLevel.className = "match-stats-champion-level";
        statsContent2.appendChild(statsChampionLevel);

        //create the stats cs
        const statsCs = document.createElement("h5");
        statsCs.innerHTML = `${playerChamp.totalMinionsKilled} CS`;
        statsCs.className = "match-stats-cs";
        statsContent2.appendChild(statsCs);

        //create the stats gold
        const statsGold = document.createElement("h5");
        statsGold.innerHTML = `${playerChamp.goldEarned}<i class="bi bi-currency-bitcoin"></i>`;
        statsGold.className = "match-stats-gold";
        statsContent2.appendChild(statsGold);

        //create the stats vision score
        const statsVisionScore = document.createElement("h5");
        statsVisionScore.innerHTML = `${playerChamp.visionScore} <i class="bi bi-eye-fill"></i>`;
        statsVisionScore.className = "match-stats-vision-score";
        statsContent2.appendChild(statsVisionScore);

        //create the items part
        const items = document.createElement("div");
        items.className = "match-items";

        //create the items content
        const itemsContent = document.createElement("div");
        itemsContent.className = "match-items-content";
        items.appendChild(itemsContent);


        //create the items content
        for (let i = 0; i < 6; i++) {
            const item = document.createElement("img");
            if (playerChamp["item" + i] != 0) {
                item.src = `http://ddragon.leagueoflegends.com/cdn/${version}/img/item/${playerChamp["item" + i]}.png`;
                item.className = "match-item";
                itemsContent.appendChild(item);
            }
        }


        //append the card to the container
        card.appendChild(content);
        card.appendChild(summonerChampion);
        card.appendChild(stats);
        card.appendChild(stats2);
        card.appendChild(items);
        document.getElementById("container-match").appendChild(card);

    }
}




//extract parameters from the url
function findGetParameter(parameterName) {
    var result = null,
        tmp = [];
    location.search
        .substr(1)
        .split("&")
        .forEach(function (item) {
            tmp = item.split("=");
            if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
        });
    return result;
}

async function main() {
    await loadUser();
    await loadChamps();
    await loadMatchHistory();
}
