import { useState } from "react";
import questions from '../data/questions.json';
import '../App.css';
import title from '/title.svg';
import QuizCard from "../components/quizCard/QuizCard";
import Header from "../components/HeaderCard";
import ScoreCard from "../components/ScoreCard";
import ShowcaseCard from "../components/showcaseCard/ShowcaseCard";
// uses App.css

export default function HomePage() {
    const [tasks, setTasks] = useState(questions);
    const [showTotal, setShowTotal] = useState(false);

    const handleCheckboxChange = (categoryIndex, itemIndex) => {
        const updatedTasks = [...tasks];
        updatedTasks[categoryIndex].items[itemIndex].checked = !updatedTasks[categoryIndex].items[itemIndex].checked;
        setTasks(updatedTasks);
    };

    const handleShowTotal = () => setShowTotal(true);

    const handleClear = () => {
        const clearedTasks = tasks.map(group => ({
            ...group,
            items: group.items.map(item => ({ ...item, checked: false }))
        }));
        setTasks(clearedTasks);
    };

    const getTotalChecked = () => tasks.reduce(
        (sum, group) => sum + group.items.filter(item => item.checked).length, 0
    );

    return (
        <div className="container">
            <img src={title} className="title" alt="Edater Love Test" />
            {!showTotal ? (
                <>
                    <Header showTotal={showTotal} />
                    <br />
                    <ShowcaseCard />
                    <br />
                    <div style={{ textAlign: 'left' }}>
                        <div className="content-container">
                            <QuizCard tasks={tasks} onCheckboxChange={handleCheckboxChange} />
                        </div>
                        <br />
                        <div className="buttons-wrapper">
                            <button className="button" onClick={handleShowTotal}>Calculate Score</button>
                            <button className="button" onClick={handleClear}>Clear my Preferences</button>
                        </div>
                    </div>
                </>
            ) : (
                <div style={{ flex: 1 }}>
                    <Header showTotal={showTotal} />
                    <br />
                    <ShowcaseCard />
                    <br />
                    <ScoreCard total={getTotalChecked()} />
                    <br />

                </div>
            )}
            <p className="footer">© Edater Love Test 2026</p>
        </div>
    );
}
