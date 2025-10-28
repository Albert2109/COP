export default function Button({children,onClick}){
return(
    <div>
        <button onClick={onClick}>{children}</button>
    </div>
)
}