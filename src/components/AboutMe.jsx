import React, { useContext, useEffect, useState } from 'react';
import styles from "../css/aboutMe.module.css";
import { BASE_URL, period_month } from "../utils/constants.js";
import { characters } from "../utils/characters.js";
import { CharContext } from "../utils/useContext.js";

const AboutMe = () => {
    const { hero } = useContext(CharContext);
    const [isLoading, setIsLoading] = useState(true);
    const [charactersData, setCharactersData] = useState({});

    useEffect(() => {
        console.log("AboutMe mount");


        const loadCharactersFromLocalStorage = () => {
            const storedCharacters = {};
            Object.keys(characters).forEach(key => {
                const characterFromLocalStorage = JSON.parse(localStorage.getItem(`character_${characters[key].id}`));
                if (characterFromLocalStorage && (Date.now() - characterFromLocalStorage.time) < period_month) {
                    storedCharacters[key] = characterFromLocalStorage.payload;
                }
            });
            return storedCharacters;
        };

        const storedCharacters = loadCharactersFromLocalStorage();


        if (Object.keys(storedCharacters).length === Object.keys(characters).length) {
            setCharactersData(storedCharacters);
            setIsLoading(false);
        } else {

            const characterId = characters[hero].id;
            fetch(`${BASE_URL}/v1/peoples/${characterId}`)
                .then(response => response.json())
                .then(data => {
                    const heroData = {
                        name: data.name,
                        eye_color: data.eye_color,
                        gender: data.gender,
                        birth_year: data.birth_year,
                        image: `${BASE_URL}/${data.image}`
                    };
                    setIsLoading(false);
                    setCharactersData(prevData => ({
                        ...prevData,
                        [hero]: heroData
                    }));


                    const info = {
                        payload: heroData,
                        time: Date.now()
                    };
                    localStorage.setItem(`character_${characterId}`, JSON.stringify(info));
                })
                .catch(error => {
                    console.error('Error fetching character data:', error);
                    setIsLoading(false);
                });
        }

        return () => {
            console.log("AboutMe unmounted");
        };
    }, [hero]);

    if (isLoading) {
        return <div className="spinner-border text-success"></div>;
    } else {
        return (
            <div>
                {Object.keys(charactersData).map(key => (
                    <div key={key} className={styles.hero_box}>
                        <h1>Name: {charactersData[key].name}</h1>
                        <h2>Eye Color: {charactersData[key].eye_color}</h2>
                        <h3>Gender: {charactersData[key].gender}</h3>
                        <h4>Birth Year: {charactersData[key].birth_year}</h4>
                        <img className={styles.img_hero} src={charactersData[key].image} alt={charactersData[key].name} />
                    </div>
                ))}
            </div>
        );
    }
};

export default AboutMe;
