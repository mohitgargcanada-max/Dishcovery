import PostForm from '../components/forms/PostForm'

export default function PostRecipe() {
  return (
    <div className="px-4 py-6">
      <h1 className="font-display text-2xl font-bold text-[#F5F5F0] mb-6">Post a Recipe</h1>
      <PostForm />
    </div>
  )
}
