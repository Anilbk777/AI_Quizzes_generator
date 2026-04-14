from langchain_core.prompts import ChatPromptTemplate

class PromptBuilder:
    """
    A builder class for constructing LangChain prompts.
    Can be instantiated and used to generate prompts for runnables.
    """
    
    DEFAULT_SYSTEM_TEMPLATE = """\
You are an expert educator generating high-quality multiple choice questions (MCQs).
Target Difficulty: {difficulty}

STRICT OUTPUT RULES:
1. Generate EXACTLY {num_questions} questions.
2. Each question must have EXACTLY 4 options (A, B, C, D).
3. The correct_option must be the letter (A/B/C/D).
4. All options must be distinct and plausible.
5. If the provided Content is nonsensical, gibberish (e.g., "asdf", "!!!!"), or a single character that lacks context, IGNORE it and generate a high-quality quiz on a "General Knowledge" topic instead.
6. If the Content is a meaningful topic (e.g., "Machine Learning", "Photosynthesis"), generate the quiz specifically about that topic.
"""

    DEFAULT_HUMAN_TEMPLATE = """\
Content:
{content}

Please generate {num_questions} {difficulty} MCQs based on the content above. 
If the content above is just a topic name, generate questions covering that topic thoroughly.
Reminder: If the content is nonsense, generate a General Knowledge quiz instead.
"""

    def __init__(self):
        """
        Initialize the PromptBuilder with default templates.
        """
        self.system_template = self.DEFAULT_SYSTEM_TEMPLATE
        self.human_template = self.DEFAULT_HUMAN_TEMPLATE

    def build_mcq_prompt(self, difficulty: str = "medium") -> ChatPromptTemplate:
        """
        Builds and returns the ChatPromptTemplate for MCQ generation.
        This prompt can be used directly in a LangChain runnable pipeline.
        
        Example:
            builder = PromptBuilder()
            runnable = builder.build_mcq_prompt(difficulty="hard") | llm
        """ 
        return ChatPromptTemplate.from_messages([
            ("system", self.system_template.format(difficulty=difficulty, num_questions="{num_questions}")),
            ("human", self.human_template.format(difficulty=difficulty, content="{content}", num_questions="{num_questions}")),
        ])