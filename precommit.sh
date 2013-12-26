# stash unstaged changes, run release task, stage release updates and restore stashed files

NAME=$(git branch | grep '*' | sed 's/* //')

# don't run on rebase or in any other branch than develop
if [ "$NAME" = "develop" ] && [ $NAME != '(no branch)' ]
then
  git stash -q --keep-index
  grunt pre-commit

  RETVAL=$?

  if [ $RETVAL -ne 0 ]
  then
  	git stash pop -q
    exit 1
  fi

  git add -u
  git add .

  git stash pop -q

  echo 'Finished!'
else
	echo 'Currently on '$NAME' branch. Testing and deploying only occurs on develop'
fi

exit 0
