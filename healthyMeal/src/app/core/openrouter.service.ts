import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { map } from 'rxjs/operators';

export interface RecipeGenerationRequest {
  prompt: string;
  preferences?: {
    calories?: number;
    allergens?: string[];
    macros?: {
      protein?: number;
      carbs?: number;
      fat?: number;
    };
  };
}

export interface RecipeGenerationResponse {
  recipe: {
    title: string;
    description: string;
    ingredients: {
      name: string;
      amount: string;
      unit: string;
    }[];
    instructions: string[];
    nutrition: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    };
    cooking_time: number;
    difficulty: 'easy' | 'medium' | 'hard';
  };
}

@Injectable({
  providedIn: 'root'
})
export class OpenRouterService {
  private readonly API_URL = environment.openRouterUrl;
  private readonly MODEL = environment.openRouterModel;

  constructor(private http: HttpClient) {}

  generateRecipe(request: RecipeGenerationRequest): Observable<RecipeGenerationResponse> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${environment.openRouterKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': environment.appUrl,
      'X-Title': 'HealthyMeal'
    });

    const prompt = this.buildPrompt(request);
    
    const body = {
      model: this.MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are a professional chef. Generate a recipe in JSON format only. No explanations or thinking process. Just the JSON object.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: "json_object" }
    };

    return this.http.post<any>(this.API_URL, body, { headers }).pipe(
      map(response => this.parseRecipeResponse(response))
    );
  }

  private buildPrompt(request: RecipeGenerationRequest): string {
    let prompt = `Generate a recipe based on the following preferences:\n`;
    prompt += `Description: ${request.prompt}\n`;

    if (request.preferences?.calories) {
      prompt += `Target calories: ${request.preferences.calories}\n`;
      }

    if (request.preferences?.allergens?.length) {
      prompt += `Allergens to avoid: ${request.preferences.allergens.join(', ')}\n`;
      }

    prompt += `\nPlease provide the recipe in the following JSON format:
    {
      "recipe": {
        "title": "string",
        "description": "string",
        "ingredients": [
          {
            "name": "string",
            "amount": "string",
            "unit": "string"
          }
        ],
        "instructions": ["string"],
        "nutrition": {
          "calories": number,
          "protein": number,
          "carbs": number,
          "fat": number
        },
        "cooking_time": number,
        "difficulty": "easy" | "medium" | "hard"
      }
    }

    Notes:
    - cooking_time should be in minutes
    - difficulty should be one of: "easy", "medium", "hard"
    - amount in ingredients should be a string that includes both the number and unit (e.g., "2 cups", "1/4 teaspoon")
    - nutrition values should be in grams except for calories
    - instructions should be an array of step-by-step instructions`;

    return prompt;
  }

  private parseRecipeResponse(response: any): RecipeGenerationResponse {
    try {
      console.log('Raw response:', response);
      
      if (!response.choices?.[0]?.message?.content) {
        console.error('Invalid response structure:', response);
        throw new Error('Invalid response format from OpenRouter');
      }

      const content = response.choices[0].message.content.trim();
      console.log('Response content:', content);

      // Try to extract JSON from the response if it contains additional text
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('No JSON found in content:', content);
        throw new Error('No JSON object found in response');
      }

      const jsonContent = jsonMatch[0];
      console.log('Extracted JSON content:', jsonContent);

      const recipeData = JSON.parse(jsonContent);
      console.log('Parsed recipe data:', recipeData);

      if (!recipeData.recipe) {
        console.error('Missing recipe object in data:', recipeData);
        throw new Error('Invalid recipe data format');
      }

      // Validate required fields
      const requiredFields = ['title', 'description', 'ingredients', 'instructions', 'nutrition'];
      const missingFields = requiredFields.filter(field => !recipeData.recipe[field]);
      if (missingFields.length > 0) {
        console.error('Missing required fields:', missingFields);
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      return recipeData;
    } catch (error) {
      console.error('Error parsing recipe response:', error);
      console.error('Response that caused the error:', response);
      throw new Error('Failed to parse recipe response');
    }
  }
} 