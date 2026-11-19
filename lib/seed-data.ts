export interface ProfileSeed {
  id: string;
  name: string;
  age: number;
  photo: string;
  bio: string;
  location: string;
  interests: string[];
}

export const ME = {
  id: 'me',
  name: 'Alex',
  age: 24,
  photo: 'https://i.pravatar.cc/600?img=68',
};

export const PROFILES: ProfileSeed[] = [
  { id: 'p1',  name: 'Maya',     age: 23, photo: 'https://i.pravatar.cc/600?img=1',  bio: 'Ceramics nerd who throws pots at 6am before my architecture studio opens.', location: 'Brooklyn, NY', interests: ['Ceramics', 'Architecture', 'Coffee', 'Hiking'] },
  { id: 'p2',  name: 'Jordan',   age: 25, photo: 'https://i.pravatar.cc/600?img=2',  bio: 'ER nurse who decompresses with crossword puzzles and reality TV deep dives.', location: 'Chicago, IL', interests: ['Crosswords', 'Reality TV', 'Cooking', 'Running'] },
  { id: 'p3',  name: 'Priya',    age: 22, photo: 'https://i.pravatar.cc/600?img=3',  bio: 'CS major at Stanford. I build keyboards and argue about fonts.', location: 'Stanford University', interests: ['Mechanical Keyboards', 'Typography', 'Coding', 'Boba'] },
  { id: 'p4',  name: 'Liam',     age: 27, photo: 'https://i.pravatar.cc/600?img=4',  bio: 'Sous chef who can make a full meal out of whatever\'s in your fridge. Try me.', location: 'Austin, TX', interests: ['Cooking', 'Fermentation', 'Vinyl Records', 'Soccer'] },
  { id: 'p5',  name: 'Sofia',    age: 21, photo: 'https://i.pravatar.cc/600?img=5',  bio: 'Double-majoring in marine bio and Spanish lit. I talk to dolphins and poets.', location: 'UC San Diego', interests: ['Marine Biology', 'Poetry', 'Surfing', 'Thrifting'] },
  { id: 'p6',  name: 'Kai',      age: 24, photo: 'https://i.pravatar.cc/600?img=6',  bio: 'Freelance illustrator and terrible bassist. Currently drawing a graphic novel about pigeons.', location: 'Portland, OR', interests: ['Illustration', 'Bass Guitar', 'Comics', 'Birds'] },
  { id: 'p7',  name: 'Aisha',    age: 26, photo: 'https://i.pravatar.cc/600?img=7',  bio: 'Tax attorney by day, roller derby queen by night. Yes, really.', location: 'Washington, DC', interests: ['Roller Derby', 'Law', 'Board Games', 'Yoga'] },
  { id: 'p8',  name: 'Marcus',   age: 28, photo: 'https://i.pravatar.cc/600?img=8',  bio: 'High-school physics teacher who builds model rockets in the summer. Nerd and proud.', location: 'Denver, CO', interests: ['Rocketry', 'Physics', 'Camping', 'Photography'] },
  { id: 'p9',  name: 'Zara',     age: 22, photo: 'https://i.pravatar.cc/600?img=9',  bio: 'Fashion design student who skateboards to class. If I\'m late it\'s the ollie\'s fault.', location: 'Parsons School of Design', interests: ['Fashion', 'Skateboarding', 'Vintage', 'Drawing'] },
  { id: 'p10', name: 'Ethan',    age: 25, photo: 'https://i.pravatar.cc/600?img=10', bio: 'Data analyst who runs ultra-marathons. I like patterns in spreadsheets and trails.', location: 'Seattle, WA', interests: ['Running', 'Data Science', 'Trail Running', 'Jazz'] },
  { id: 'p11', name: 'Luna',     age: 23, photo: 'https://i.pravatar.cc/600?img=11', bio: 'Vet tech who fosters kittens. My apartment is never quiet and I love it.', location: 'Nashville, TN', interests: ['Animals', 'Fostering', 'Country Music', 'Baking'] },
  { id: 'p12', name: 'Noah',     age: 26, photo: 'https://i.pravatar.cc/600?img=12', bio: 'Climbing gym routesetter and part-time barista. I know every hold and every latte art pattern.', location: 'Boulder, CO', interests: ['Rock Climbing', 'Coffee', 'Photography', 'Yoga'] },
  { id: 'p13', name: 'Amara',    age: 24, photo: 'https://i.pravatar.cc/600?img=13', bio: 'Biomedical engineering PhD candidate. I 3D-print prosthetics and binge sci-fi novels.', location: 'MIT', interests: ['3D Printing', 'Sci-Fi', 'Engineering', 'Dancing'] },
  { id: 'p14', name: 'Tyler',    age: 29, photo: 'https://i.pravatar.cc/600?img=14', bio: 'Wildland firefighter in the off-season. Huge into woodworking and terrible at chess.', location: 'Boise, ID', interests: ['Woodworking', 'Firefighting', 'Chess', 'Hiking'] },
  { id: 'p15', name: 'Hana',     age: 21, photo: 'https://i.pravatar.cc/600?img=15', bio: 'Poli-sci undergrad interning at a think tank. I debate everything, even pizza toppings.', location: 'Georgetown University', interests: ['Politics', 'Debate', 'Pizza', 'Podcasts'] },
  { id: 'p16', name: 'Desi',     age: 27, photo: 'https://i.pravatar.cc/600?img=16', bio: 'Music producer who collects field recordings. Recorded rain in 14 countries so far.', location: 'Los Angeles, CA', interests: ['Music Production', 'Travel', 'Field Recording', 'Vinyl'] },
  { id: 'p17', name: 'Ivy',      age: 23, photo: 'https://i.pravatar.cc/600?img=17', bio: 'Botanical garden intern and watercolor painter. I know way too much about ferns.', location: 'Philadelphia, PA', interests: ['Botany', 'Watercolor', 'Ferns', 'Tea'] },
  { id: 'p18', name: 'Ravi',     age: 25, photo: 'https://i.pravatar.cc/600?img=18', bio: 'Product designer at a startup. I prototype apps and cook elaborate biryanis on Sundays.', location: 'San Francisco, CA', interests: ['Product Design', 'Cooking', 'Biryani', 'Figma'] },
  { id: 'p19', name: 'Celine',   age: 22, photo: 'https://i.pravatar.cc/600?img=19', bio: 'Dance major specializing in contemporary. I choreograph to weird electronic music.', location: 'Juilliard', interests: ['Dance', 'Choreography', 'Electronic Music', 'Film'] },
  { id: 'p20', name: 'Oliver',   age: 30, photo: 'https://i.pravatar.cc/600?img=20', bio: 'Carpenter who restores mid-century furniture. If it\'s teak, I\'m interested.', location: 'Asheville, NC', interests: ['Carpentry', 'Mid-Century Modern', 'Antiques', 'Beer'] },
  { id: 'p21', name: 'Noor',     age: 24, photo: 'https://i.pravatar.cc/600?img=21', bio: 'Journalism grad student covering local food scenes. Will travel for a great taco.', location: 'Columbia University', interests: ['Journalism', 'Food', 'Tacos', 'Street Photography'] },
  { id: 'p22', name: 'Blake',    age: 26, photo: 'https://i.pravatar.cc/600?img=22', bio: 'DevOps engineer and amateur astronomer. I debug pipelines by day and stargaze by night.', location: 'Minneapolis, MN', interests: ['Astronomy', 'DevOps', 'Stargazing', 'Board Games'] },
  { id: 'p23', name: 'Sienna',   age: 21, photo: 'https://i.pravatar.cc/600?img=23', bio: 'Environmental science student who leads campus cleanups and makes earrings from beach glass.', location: 'UC Santa Cruz', interests: ['Environment', 'Jewelry Making', 'Beach', 'Sustainability'] },
  { id: 'p24', name: 'Andre',    age: 28, photo: 'https://i.pravatar.cc/600?img=24', bio: 'Physical therapist and weekend DJ. I fix your back and then make it move on the dance floor.', location: 'Atlanta, GA', interests: ['DJing', 'Physical Therapy', 'Dancing', 'Sneakers'] },
  { id: 'p25', name: 'Tess',     age: 23, photo: 'https://i.pravatar.cc/600?img=25', bio: 'Math PhD student who does improv comedy. Proof by contradiction is basically a bit.', location: 'University of Chicago', interests: ['Math', 'Improv', 'Comedy', 'Puzzles'] },
  { id: 'p26', name: 'Mateo',    age: 25, photo: 'https://i.pravatar.cc/600?img=26', bio: 'Landscape architect who photographs brutalist buildings on weekends. Concrete is beautiful.', location: 'Miami, FL', interests: ['Architecture', 'Photography', 'Brutalism', 'Swimming'] },
  { id: 'p27', name: 'Yuki',     age: 22, photo: 'https://i.pravatar.cc/600?img=27', bio: 'Animation student at CalArts. I draw flip-books during boring lectures.', location: 'CalArts', interests: ['Animation', 'Drawing', 'Studio Ghibli', 'Ramen'] },
  { id: 'p28', name: 'Devin',    age: 27, photo: 'https://i.pravatar.cc/600?img=28', bio: 'Park ranger who writes haiku about the animals I see on patrol. It\'s a niche hobby.', location: 'Yellowstone, WY', interests: ['Nature', 'Haiku', 'Wildlife', 'Backpacking'] },
  { id: 'p29', name: 'Freya',    age: 24, photo: 'https://i.pravatar.cc/600?img=29', bio: 'Glassblower and part-time yoga instructor. I make ornaments and find my center.', location: 'Santa Fe, NM', interests: ['Glassblowing', 'Yoga', 'Art', 'Desert Hikes'] },
  { id: 'p30', name: 'Idris',    age: 26, photo: 'https://i.pravatar.cc/600?img=30', bio: 'Civil engineer obsessed with bridges. I have strong opinions about trusses.', location: 'Pittsburgh, PA', interests: ['Engineering', 'Bridges', 'History', 'Cycling'] },
  { id: 'p31', name: 'Rosa',     age: 20, photo: 'https://i.pravatar.cc/600?img=31', bio: 'Pre-med student who paints murals in her free time. Anatomy knowledge helps with proportions.', location: 'Johns Hopkins University', interests: ['Painting', 'Medicine', 'Murals', 'Salsa Dancing'] },
  { id: 'p32', name: 'Theo',     age: 29, photo: 'https://i.pravatar.cc/600?img=32', bio: 'Sommelier at a wine bar who also makes hot sauce. My palate is confused but happy.', location: 'Napa Valley, CA', interests: ['Wine', 'Hot Sauce', 'Fermentation', 'Cycling'] },
];

// Profiles that have already liked the logged-in user (spread across feed)
// Indices in the PROFILES array: 2, 5, 8, 11, 15, 20, 25, 29 (8 profiles)
export const INCOMING_LIKE_IDS = ['p3', 'p6', 'p9', 'p12', 'p16', 'p21', 'p26', 'p30'];
