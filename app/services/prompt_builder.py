from langchain_core.prompts import ChatPromptTemplate

class PromptBuilder:
    """
    A builder class for constructing LangChain prompts.
    Can be instantiated and used to generate prompts for runnables.
    """
    
    DEFAULT_SYSTEM_TEMPLATE = """\
You are an expert educator generating multiple choice questions (MCQs).

STRICT OUTPUT RULES — you must follow these exactly:
1. Generate EXACTLY {num_questions} questions, no more, no less.
2. Each question has EXACTLY 4 options: A, B, C, D.
3. The correct_option field must be the LETTER (A/B/C/D) whose text is the correct answer.
4. All 4 options must be distinct — no duplicates within a question.
5. Distractors (wrong options) must be plausible, not obviously incorrect.
6. No two questions may test the same concept.
7. Spread difficulty: include easy, medium, and hard questions.
8. question text must never be empty.
"""

    DEFAULT_HUMAN_TEMPLATE = """\
Content:
{content}

Generate {num_questions} MCQs from the content above.
"""

    def __init__(self):
        """
        Initialize the PromptBuilder with default templates.
        """
        self.system_template = self.DEFAULT_SYSTEM_TEMPLATE
        self.human_template = self.DEFAULT_HUMAN_TEMPLATE

    def build_mcq_prompt(self) -> ChatPromptTemplate:
        """
        Builds and returns the ChatPromptTemplate for MCQ generation.
        This prompt can be used directly in a LangChain runnable pipeline.
        
        Example:
            builder = PromptBuilder()
            runnable = builder.build_mcq_prompt() | llm
        """ 
        return ChatPromptTemplate.from_messages([
            ("system", self.system_template),
            ("human", self.human_template),
        ])