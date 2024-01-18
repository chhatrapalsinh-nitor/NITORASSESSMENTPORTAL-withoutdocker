from datetime import timedelta

def get_total_duration(question_details):
    duration = timedelta(minutes=0)
    time_mapping = {
        '1': timedelta(minutes=1),
        '2': timedelta(minutes=3),
        '3': timedelta(minutes=5)
    }

    program_mapping = {
        'easy_program_count': timedelta(minutes=15),
        'medium_program_count': timedelta(minutes=30),
        'hard_program_count': timedelta(minutes=45)
    }

    for i in question_details:
        mcq_count = int(i.get('mcq_count', 0))
        mcq_difficulty = int(i.get('mcq_difficulty'))

        if mcq_count and mcq_difficulty:
            duration += time_mapping.get(mcq_difficulty, timedelta()) * mcq_count

        for key, value in program_mapping.items():
            program_count = int(i.get(key, 0))
            duration += value * program_count
    return duration
