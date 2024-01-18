const baseURL = "http://localhost:8000/";
const baseURL_TEST = "https://jsonplaceholder.typicode.com";
const templateJSONData = {
    'mcq': [
        {
            'name': 'Is python a programming language?',
            'type': 1,
            'difficulty': 1,
            'language': 'python',
            'option1': 'Yes',
            'option2': 'No',
            'option3': null,
            'option4': null,
            'correct_value': 'Yes',
        }
    ],
    'programs': [
        {
            'name': 'Write a program',
            'type': 2,
            'difficulty': 1,
            'language': 'python',
            'case1': 'case1',
            'case2': 'case2',
            'case3': 'case3',
            'case4': 'case4',
        }
    ]
}

const languageOptions = [
    {id: 1, label: 'C#', name: 'C#', value: 'C#'},
    {id: 3, label: 'F#', name: 'F#', value: 'F#'},
    {id: 4, label: 'Java', name: 'Java', value: 'Java'},
    {id: 5, label: 'Python', name: 'Python', value: 'Python'},
    {id: 6, label: 'C (gcc)', name: 'C (gcc)', value: 'C (gcc)'},
    {id: 7, label: 'C++ (gcc)', name: 'C++ (gcc)', value: 'C++ (gcc)'},
    {id: 8, label: 'Php', name: 'Php', value: 'Php'},
    {id: 11, label: 'Haskell', name: 'Haskell', value: 'Haskell'},
    {id: 12, label: 'Ruby', name: 'Ruby', value: 'Ruby'},
    {id: 13, label: 'Perl', name: 'Perl', value: 'Perl'},
    {id: 14, label: 'Lua', name: 'Lua', value: 'Lua'},
    {id: 15, label: 'Nasm', name: 'Nasm', value: 'Nasm'},
    {id: 17, label: 'Javascript', name: 'Javascript', value: 'Javascript'},
    {id: 20, label: 'Go', name: 'Go', value: 'Go'},
    {id: 21, label: 'Scala', name: 'Scala', value: 'Scala'},
    {id: 30, label: 'D', name: 'D', value: 'D'},
    {id: 37, label: 'Swift', name: 'Swift', value: 'Swift'},
    {id: 38, label: 'Bash', name: 'Bash', value: 'Bash'},
    {id: 40, label: 'Erlang', name: 'Erlang', value: 'Erlang'},
    {id: 41, label: 'Elixir', name: 'Elixir', value: 'Elixir'},
    {id: 42, label: 'Ocaml', name: 'Ocaml', value: 'Ocaml'},
    {id: 43, label: 'Kotlin', name: 'Kotlin', value: 'Kotlin'},
    {id: 46, label: 'Rust', name: 'Rust', value: 'Rust'},
    {id: 47, label: 'Clojure', name: 'Clojure', value: 'Clojure'},
    {id: 48, label: 'ATS', name: 'ATS', value: 'ATS'},
    {id: 49, label: 'Cobol', name: 'Cobol', value: 'Cobol'},
    {id: 50, label: 'Coffeescript', name: 'Coffeescript', value: 'Coffeescript'},
    {id: 51, label: 'Crystal', name: 'Crystal', value: 'Crystal'},
    {id: 52, label: 'Elm', name: 'Elm', value: 'Elm'},
    {id: 53, label: 'Groovy', name: 'Groovy', value: 'Groovy'},
    {id: 54, label: 'Idris', name: 'Idris', value: 'Idris'},
    {id: 55, label: 'Julia', name: 'Julia', value: 'Julia'},
    {id: 56, label: 'Mercury', name: 'Mercury', value: 'Mercury'},
    {id: 57, label: 'Nim', name: 'Nim', value: 'Nim'},
    {id: 58, label: 'Nix', name: 'Nix', value: 'Nix'},
    {id: 59, label: 'Raku', name: 'Raku', value: 'Raku'},
    {id: 60, label: 'TypeScript', name: 'TypeScript', value: 'TypeScript'}
];

const optionList = [
    {
        title: 'Option 1',
        dataIndex: 'option1',
        key: 'option1',
    },
    {
        title: 'Option 2',
        dataIndex: 'option2',
        key: 'option2',
    },
    {
        title: 'Option 3',
        dataIndex: 'option3',
        key: 'option3',
    },
    {
        title: 'Option 4',
        dataIndex: 'option4',
        key: 'option4',
    },
    {
        title: 'Correct Answer',
        dataIndex: 'correct_value',
        key: 'correct_value',
    },
]

const caseList = [
    {
        title: 'Case 1',
        dataIndex: 'case1',
        key: 'case1',
    },
    {
        title: 'Case 2',
        dataIndex: 'case2',
        key: 'case2',
    },
    {
        title: 'Case 3',
        dataIndex: 'case3',
        key: 'case3',
    },
    {
        title: 'Case 4',
        dataIndex: 'case4',
        key: 'case4',
    },
]

const TestLinkTable = [
    {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
    },

    {
        title: 'End Date',
        dataIndex: 'end_date',
        key: 'end_date',
    },

    {
        title: 'Test',
        dataIndex: 'test',
        key: 'test',
    },
]

const userFormFields = [
    {
        title: 'First Name',
        dataIndex: 'first_name',
        key: 'first_name',
    },
    {
        title: 'Last Name',
        dataIndex: 'last_name',
        key: 'last_name',
    },
    {
        title: 'Email',
        dataIndex: 'email',
        key: 'email',
    },
    
]

const CreateTestForm = [
    {
        title: 'Test Name',
        dataIndex: 'name',
        key: 'name',
    },
    {
        title: 'Language Name',
        dataIndex: 'language',
        key: 'language',
        // render: (question_details) => question_details.map(language => language.name).join(),
        sorter: (a, b) => a.language - b.language,
    },
    {
        title: 'MCQ Count',
        dataIndex: 'mcq_count',
        key: 'mcq_count',
    },
    {
        title: 'Easy Programs',
        dataIndex: 'easy_program_count',
        key: 'easy_program_count',
    },
    {
        title: 'Medium Program',
        dataIndex: 'medium_program_count',
        key: 'medium_program_count',
    },
    {
        title: 'Hard Program',
        dataIndex: 'hard_program_count',
        key: 'hard_program_count',
    },
]

export {
    baseURL,
    languageOptions,
    templateJSONData,
    optionList,
    caseList,
    TestLinkTable,
    userFormFields,
    CreateTestForm
}
