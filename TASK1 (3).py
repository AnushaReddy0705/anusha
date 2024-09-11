# Step 1: Import the required libraries
import os
import requests
from bs4 import BeautifulSoup

# Function to scrape and save the article
def scrape_medium_article(url):
    # Step 2: Send a GET request to fetch the HTML content
    response = requests.get(url)

    # Step 3: Check if the request was successful (status code 200)
    if response.status_code == 200:
        # Step 4: Parse the HTML content using BeautifulSoup
        soup = BeautifulSoup(response.content, 'html.parser')

        # Step 5: Extract all text within <p> tags (paragraphs)
        paragraphs = soup.find_all('p')
        article_text = ''
        for p in paragraphs:
            article_text += p.get_text() + '\n\n'

        # Step 6: Create a folder named 'scraped_articles' if it doesn't exist
        if not os.path.exists('scraped_articles'):
            os.makedirs('scraped_articles')

        # Step 7: Define the file name and save path
        file_path = os.path.join('scraped_articles', 'future_of_ai_healthcare.txt')

        # Step 8: Write the scraped text to the file
        with open(file_path, 'w', encoding='utf-8') as file:
            file.write(article_text)

        print(f"Article successfully scraped and saved at {file_path}")
    else:
        print("Failed to retrieve the webpage. Status code:", response.status_code)

# Step 9: Replace with your Medium article URL
url = 'https://mcpress.mayoclinic.org/healthy-aging/ai-in-healthcare-the-future-of-patient-care-and-health-management/'

# Step 10: Call the function to scrape and save the article
scrape_medium_article(url)


# Print the current working directory
print(f"Current working directory: {os.getcwd()}")

