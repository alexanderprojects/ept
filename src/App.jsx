import { useState } from "react";
import questions from './data/questions.json';
import './App.css';
import title from '/title.svg';
import QuizCard from "./components/quizCard/QuizCard";
import Header from "./components/Header";
import AdColumn from "./components/AdColumn";
import ScoreCard from "./components/ScoreCard";
import ShowcaseAd from "./components/showcaseCard/ShowcaseCard";


function App() {
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
					<Header showTotal={showTotal} /> {/* render descrption */}
					<br />
					<ShowcaseAd />
					<br />
					<div style={{ textAlign: 'left' }}>
						{/* 	rendertasklist() */}
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
					<ScoreCard total={getTotalChecked()} />
				</div>
			)}
			<p className="footer">© Alexander 2025</p>
		</div>
	);
}

export default App;
