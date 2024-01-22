from datetime import timedelta

def get_total_duration(question_details):
    duration = timedelta(minutes=0)
    EASY_MCQ_COUNT = "easy_mcq_count"
    MEDIUM_MCQ_COUNT = "medium_mcq_count"
    HARD_MCQ_COUNT = "hard_mcq_count"

    time_mapping = {
        EASY_MCQ_COUNT: timedelta(minutes=1),
        MEDIUM_MCQ_COUNT: timedelta(minutes=3),
        HARD_MCQ_COUNT: timedelta(minutes=5)
    }

    program_mapping = {
        'easy_program_count': timedelta(minutes=15),
        'medium_program_count': timedelta(minutes=30),
        'hard_program_count': timedelta(minutes=45)
    }

    for i in question_details:
        easy_mcq_count = int(i.get(EASY_MCQ_COUNT, 0))
        medium_mcq_count = int(i.get(MEDIUM_MCQ_COUNT, 0))
        hard_mcq_count = int(i.get(HARD_MCQ_COUNT, 0))
        duration += (time_mapping.get(EASY_MCQ_COUNT, timedelta()) * easy_mcq_count +
                    time_mapping.get(MEDIUM_MCQ_COUNT, timedelta()) * medium_mcq_count +
                    time_mapping.get(HARD_MCQ_COUNT, timedelta()) * hard_mcq_count)

        for key, value in program_mapping.items():
            program_count = int(i.get(key, 0))
            duration += value * program_count
    return duration
