namespace BeardBrosTrivia.Models
{
    public class Quote
    {
        public Quote(string text, string author)
        {
            Text = text;
            Author = author;
        }

        public string Text { get; set; }

        public string Author { get; set; }
    }
}