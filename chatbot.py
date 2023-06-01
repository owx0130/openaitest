import os
import openai
OPENAI_API_KEY="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"

openai.api_key = OPENAI_API_KEY
openai.Completion.create(
  model="text-davinci-003",
  prompt="Say this is a test",
  max_tokens=7,
  temperature=0
)
