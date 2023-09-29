function extractDates(element) {
    // Extract the date string from the work experience element

    position = element.querySelector('.pvs-entity')

    let [logo, details] = position.children; // We do not even need logo for now


    let position_details_list = details.children
    let position_summary_details = position_details_list[0]
    let position_summary_text = position_details_list[1]
    let outer_positions = position_summary_details.children[0].children

    if (outer_positions.length == 4) {
        dateElement = outer_positions[2].getElementsByTagName('span')[0];
    } else if (outer_positions.length == 3) {
        if (outer_positions[2].innerText.includes("·")) {
            dateElement = outer_positions[2].getElementsByTagName('span')[0];
        } else {
            dateElement = outer_positions[1].getElementsByTagName('span')[0];
        }
    }

    // If experience has multiple inner entries, get date ranges of the last entry
    if (position_summary_text && position_summary_text.querySelector('.pvs-list').querySelector('.pvs-list').children.length > 1) {
        last_inner_experience = position_summary_text.querySelector('.pvs-list').children[0]
        last_inner_experience_details = last_inner_experience.getElementsByTagName("a")[0].children
        // Override dateElement
        dateElement = last_inner_experience_details[1]
    }

    if (!dateElement) {
        return { error: 'Date element not found' };
    }

    const dateString = dateElement.innerText.split('·')[0];
    const [start, end] = dateString.split('-');//.map(str => str.trim());

    if (!start || !end) {
        return { error: `Failed to split date string: ${dateString}` };
    }

    // Convert the date strings to Date objects for easier comparison
    const startDate = new Date(start === 'Present' ? Date.now() : start + " 1");
    const endDate = new Date(end === 'Present' ? Date.now() : end + " 1");

    if (!startDate || !endDate || isNaN(startDate) || isNaN(endDate)) {
        return { error: `Invalid date conversion. Start: ${start}, End: ${end}` };
    }

    return { startDate, endDate };
}

function calculateGapOrOverlap(previous, current) {
    const gapInMonths = (current.startDate.getFullYear() - previous.endDate.getFullYear()) * 12 + current.startDate.getMonth() - previous.endDate.getMonth() - 1;
    if (gapInMonths > 0) {
        return `Gap of ${gapInMonths} month${gapInMonths > 1 ? 's' : ''}`;
    } else if (gapInMonths < 0) {
        return `Overlap of ${-gapInMonths} month${-gapInMonths > 1 ? 's' : ''}`;
    } else {
        return 'No gap or overlap';
    }
}

function insertPlaceholderBoxes() {
    const workExperienceBlock =  document.getElementById("experience");
    const experienceHeader = workExperienceBlock.nextElementSibling;
    const workExperiences = experienceHeader.nextElementSibling.querySelector('.pvs-list').querySelectorAll('.artdeco-list__item');

    for (let idx = 0; idx < workExperiences.length - 1; idx++) {
        // Create box
        const box = document.createElement('div');
        box.style.border = '1px solid blue';
        box.style.margin = '10px 0';
        box.style.padding = '5px';


        // Extract date ranger for previous and current work experience
        const previousExperienceDates = extractDates(workExperiences[idx + 1]);
        const currentExperienceDates = extractDates(workExperiences[idx]);
        // Compare dates and calculates gap or overlap
        if (previousExperienceDates.error || currentExperienceDates.error) {
            box.innerText = previousExperienceDates.error || currentExperienceDates.error;
        } else {
            box.innerText = calculateGapOrOverlap(previousExperienceDates, currentExperienceDates);
        }

        workExperiences[idx].parentNode.insertBefore(box, workExperiences[idx].nextSibling);
    }
}

setTimeout(insertPlaceholderBoxes, 3000);
