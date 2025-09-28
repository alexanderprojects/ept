import './QuizCard.css';

export default function QuizCard({ tasks, onCheckboxChange }) {
    let count = 1;

    return (
        <div className="card all-sections-wrapper">
            {tasks.map((taskGroup, categoryIndex) => (
                <div key={categoryIndex}>
                    <h3 className="section-header">{taskGroup.category}</h3>
                    <div className="question-group-wrapper">
                        {taskGroup.items.map((item, itemIndex) => (
                            <div key={itemIndex} className="question-wrapper">
                                <div className="number">{count++}.</div>
                                <label className="check-label">
                                    <div>
                                        <input
                                            type="checkbox"
                                            checked={item.checked}
                                            onChange={() => onCheckboxChange(categoryIndex, itemIndex)}
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
    );
}
