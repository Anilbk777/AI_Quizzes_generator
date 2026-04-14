import sys
import os

# Add the project root to sys.path
sys.path.append(os.path.abspath("c:/Users/Dell/Desktop/New folder (4)/ai-quiz-app"))

from app.utils.text_chunking import TextChunker
from app.services.prompt_builder import PromptBuilder
from app.domain.enums import Difficulty

def test_chunker():
    chunker = TextChunker()
    topic = "machine learning"
    chunks = chunker.create_documents(topic)
    print(f"Topic: '{topic}'")
    print(f"Number of chunks: {len(chunks)}")
    if chunks:
        print(f"First chunk: '{chunks[0].page_content}'")
    
    content = chunker.get_content(topic, 5)
    print(f"Merged content (get_content): '{content}'")
    assert content == topic or content == "", "Chunker should return topic or empty string if filtered"

def test_prompt_nonsense():
    builder = PromptBuilder()
    prompt = builder.build_mcq_prompt(difficulty=Difficulty.MEDIUM.value)
    
    # Check if the templates contain the new instructions
    system_msg = builder.system_template
    human_msg = builder.human_template
    
    print("\nVerifying Prompt Templates:")
    if "nonsensical" in system_msg and "General Knowledge" in system_msg:
        print("✅ System prompt includes nonsense handling.")
    else:
        print("❌ System prompt missing nonsense handling.")
        
    if "nonsense" in human_msg:
        print("✅ Human prompt includes nonsense reminder.")
    else:
        print("❌ Human prompt missing nonsense reminder.")

if __name__ == "__main__":
    test_chunker()
    test_prompt_nonsense()
