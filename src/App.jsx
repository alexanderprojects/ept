import { useState } from "react";
import questions from './data.json';
import './App.css'
import title from '/title.svg'


function App() {
	const [tasks, setTasks] = useState(questions);
	// State to track whether the total score is displayed
	const [showTotal, setShowTotal] = useState(false);

	const handleCheckboxChange = (categoryIndex, itemIndex) => {
		const updatedTasks = [...tasks];
		updatedTasks[categoryIndex].items[itemIndex].checked = !updatedTasks[categoryIndex].items[itemIndex].checked;
		setTasks(updatedTasks);
	};

	const renderTaskList = () => {
		let count = 1;

		return (
			<div className="card all-sections-wrapper">
				{/* one section */}
				{tasks.map((taskGroup, categoryIndex) => (
					<div key={categoryIndex}>
						<h3 className="section-header"> {taskGroup.category}</h3>
						{/* below no-heading for last question */}
						{/* {taskGroup.category != "<3" ? <h3 className="section-header"> {taskGroup.category}</h3> : <br />} */}
						{/* one question */}
						<div className="question-group-wrapper">
							{taskGroup.items.map((item, itemIndex) => (
								<div key={itemIndex} className="question-wrapper" inert>
									<div className="number">{count++}.</div>
									<label className="check-label">
										<div>
											<input
												type="checkbox"
												checked={item.checked}
												onChange={() => handleCheckboxChange(categoryIndex, itemIndex)}
											/>
										</div>
										<div className="question">{item.question}</div>
									</label>
								</div>
							))}
						</div>
					</div>
				))}
			</div>
		)
	};

	const renderDescription = () => {
		if (!showTotal) {
			return (
				<div className="card">
					<p><i> The official e-dating quiz that evaluates your e-dating score. The questions cover all aspects of the online dating world, from the most common to the most extreme experiences. <u>Warning:</u> This quiz references self harm.</i> </p>
					<br />
					<p><b>Disclaimer: these questions <u>ONLY</u> apply to the online environment.<br />&apos;them&apos; refers to an online partner or love interest.</b></p>
					<br />
					<p>Click on every item you have done.</p>
				</div>
			)
		} else {
			return (
				<div className="card">
					<p><i> The official e-dating survey that evaluates your e-dating score accurately. The questions cover all aspects of the online dating world, from the most common to the most extreme experiences. </i></p>
				</div>
			)
		}
	}
	const getTotalChecked = () => {
		let totalChecked = 0;
		tasks.forEach((taskGroup) => {
			taskGroup.items.forEach((item) => {
				if (item.checked) totalChecked++;
			});
		});
		return totalChecked

	};
	// Function to handle the button click and show total
	const handleShowTotal = () => {
		setShowTotal(true); // Hide the task list and show the total score
	};
	const handleClear = () => {
		// Create a deep copy of the tasks and reset the checked property for each item
		const clearedTasks = tasks.map(taskGroup => ({
			...taskGroup,
			items: taskGroup.items.map(item => ({
				...item,
				checked: false // Reset each checkbox to false (unchecked)
			}))
		}));

		setTasks(clearedTasks); // Update the tasks state with cleared checkboxes
	};

	return (
		<div className="container">
			<img src={title} className="title" alt="Edater Love Test" />
			{!showTotal ? (
				<>
					{renderDescription()}
					<br />
					<div style={{ textAlign: 'left' }}>
						{renderTaskList()}
						<br />
						<div className="buttons-wrapper">
							<button className="button" onClick={handleShowTotal}>Caclulate Score</button>
							<button className="button" onClick={handleClear}>Clear my Preferences</button>
						</div>
					</div>
				</>
			) : (
				<div style={{ flex: 1 }}>
					{renderDescription()}
					<br />
					<div className="card">
						<p><b>Your e-dating love score:</b></p>
						<br />
						<h1 className="score-value">{getTotalChecked()}</h1>
						<p style={{ color: "#EC83A8" }}>──── ౨ৎ ────</p>
						<br />
						<p style={{ color: "#EC83A8" }}><i>Your score is the total amount of questions you ticked yes to.</i></p>
					</div>
				</div>
			)}
			<p className="footer">© Alexander 2024</p>
		</div>
	)
};

export default App;
