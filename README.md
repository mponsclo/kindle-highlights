# Kindle Highlights Manager

A modern web application to organize and manage your Kindle highlights from clippings.txt files. Built with Next.js 14, TypeScript, Tailwind CSS, and Prisma ORM.

## Features

- 📚 **Organize by Books**: Automatically groups highlights by book and author
- 🔍 **Powerful Search**: Search across highlights, books, and authors
- 🏷️ **Tagging System**: Create custom tags to categorize highlights by themes
- 📊 **Dashboard View**: Clean interface to browse your reading insights
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices
- 🚀 **Fast Performance**: Built with Next.js and optimized for speed

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Icons**: Lucide React
- **AI Ready**: Vercel AI SDK + OpenAI API (for future features)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd kindle-highlights
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up the database**
   ```bash
   # Start the local Prisma database server
   npx prisma dev
   
   # In another terminal, push the schema to the database
   npx prisma db push
   
   # Generate the Prisma client
   npx prisma generate
   ```

4. **Configure environment variables**
   
   The `.env` file should already be created by Prisma. Add your OpenAI API key for future AI features:
   ```bash
   # OpenAI API (for future AI features)
   OPENAI_API_KEY="your-openai-api-key-here"
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open the application**
   
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Finding Your Kindle Clippings File

1. Connect your Kindle to your computer via USB
2. Navigate to the Kindle drive and open the "documents" folder
3. Find the file named "My Clippings.txt"
4. Upload this file through the web interface

### Using the Application

1. **Upload**: Use the file uploader on the home page to upload your clippings.txt file
2. **Browse**: Navigate to the dashboard to see your highlights organized by book
3. **Search**: Use the search bar to find specific highlights, books, or authors
4. **Organize**: Click on book titles to expand and see all highlights from that book

## Database Schema

The application uses four main tables:

- **books**: Stores book information (title, author)
- **highlights**: Stores individual highlights with metadata (page, location, date)
- **tags**: Stores custom tags for categorization
- **highlight_tags**: Many-to-many relationship between highlights and tags

## API Endpoints

- `POST /api/upload` - Upload and parse Kindle clippings file
- `GET /api/books` - Retrieve all books with highlight counts
- `GET /api/highlights` - Retrieve highlights with search and filtering
- `DELETE /api/highlights` - Delete specific highlights

## Project Structure

```
src/
├── app/
│   ├── api/              # API routes
│   ├── dashboard/        # Dashboard page
│   └── page.tsx         # Home page
├── components/          # Reusable UI components
│   ├── FileUploader.tsx
│   ├── HighlightCard.tsx
│   ├── SearchBar.tsx
│   └── TagManager.tsx
├── lib/                 # Utility functions
│   ├── parser.ts        # Kindle clippings parser
│   ├── prisma.ts        # Database client
│   └── types.ts         # TypeScript types
└── prisma/
    └── schema.prisma    # Database schema
```

## Future Enhancements

- 🤖 AI-powered highlight summarization
- 📤 Export to PDF, Markdown, and quote cards
- 📈 Reading analytics and insights
- 🔗 Book linking with external APIs
- 👥 Social sharing features

## Development

### Database Commands

```bash
# View database in Prisma Studio
npx prisma studio

# Reset database
npx prisma db reset

# Apply schema changes
npx prisma db push
```

### Deployment

This application can be deployed to Vercel with PostgreSQL:

1. Push your code to a Git repository
2. Connect the repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
